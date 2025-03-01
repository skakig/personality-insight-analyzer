
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useVerificationState } from "./useVerificationState";
import { useVerifyPurchase } from "./useVerifyPurchase";
import { usePreVerificationChecks } from "./usePreVerificationChecks";
import { usePostPurchaseHandler } from "./usePostPurchaseHandler";

/**
 * Handles the verification flow for purchases
 */
export const useVerificationFlow = (
  setLoading: (loading: boolean) => void,
  setResult: (result: any) => void
) => {
  const {
    verifying,
    verificationAttempts,
    startVerification,
    stopVerification,
    incrementAttempts
  } = useVerificationState();
  
  const { verifyPurchase } = useVerifyPurchase(
    setLoading, 
    setResult, 
    { 
      startVerification, 
      stopVerification, 
      incrementAttempts,
      verificationAttempts 
    }
  );

  const { checkDirectAccess, showCreateAccountToast } = usePreVerificationChecks();
  const { handleVerificationFailure, attemptDirectUpdate } = usePostPurchaseHandler();

  /**
   * Execute the verification flow for a purchase
   */
  const executeVerificationFlow = async (
    id: string | undefined, 
    options: {
      userId?: string;
      stripeSessionId?: string;
      isPostPurchase: boolean;
      storedResultId?: string;
      maxRetries: number;
    }
  ) => {
    const { userId, stripeSessionId, isPostPurchase, storedResultId, maxRetries } = options;
    console.log('Initiating purchase verification flow', {
      id,
      userId,
      stripeSessionId,
      isPostPurchase
    });
    
    const verificationId = id || storedResultId;
    
    if (!verificationId) {
      console.error('No result ID available for verification');
      toast({
        title: "Verification Error",
        description: "Missing result ID. Please try accessing your report from the dashboard.",
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }
    
    // Maximum retries check
    if (verificationAttempts >= maxRetries) {
      console.log('Maximum verification retries exceeded, attempting final direct update');
      const finalResult = await attemptDirectUpdate({
        stripeSessionId: stripeSessionId || '',
        isPostPurchase,
        verificationId,
        userId
      });
      
      if (finalResult) {
        console.log('Final direct update succeeded!');
        setResult(finalResult);
        setLoading(false);
        stopVerification();
        return finalResult;
      } else {
        console.log('Final direct update failed, redirecting to dashboard');
        // Store a flag in localStorage to show a notification on dashboard
        localStorage.setItem('purchaseVerificationFailed', 'true');
        localStorage.setItem('failedVerificationId', verificationId);
        
        toast({
          title: "Verification taking too long",
          description: "Redirecting you to the dashboard where you can access your reports.",
          variant: "default",
        });
        
        // Short delay before redirecting
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        
        return null;
      }
    }
    
    // First attempt at verifying purchase
    let success = await verifyPurchase(verificationId);
    
    // If first attempt fails and this is directly after purchase, try again
    if (!success && isPostPurchase) {
      console.log('First attempt failed, trying again after short delay');
      await new Promise(resolve => setTimeout(resolve, 1500));
      success = await verifyPurchase(verificationId);
    }
    
    // If verification failed, use fallback methods
    if (!success) {
      handleVerificationFailure(verificationAttempts);
      
      console.log('Attempting direct database update as fallback');
      const finalResult = await attemptDirectUpdate({
        stripeSessionId: stripeSessionId || '',
        isPostPurchase,
        verificationId,
        userId
      });
      
      if (finalResult) {
        console.log('Direct database update successful!');
        setResult(finalResult);
        setLoading(false);
        stopVerification();
        return finalResult;
      }
    }
    
    return null;
  };

  return {
    verifying,
    verificationAttempts,
    checkDirectAccess,
    showCreateAccountToast,
    executeVerificationFlow
  };
};
