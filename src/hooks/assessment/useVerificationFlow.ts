
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useVerificationState } from "./useVerificationState";
import { useVerifyPurchase } from "./useVerifyPurchase";
import { usePreVerificationChecks } from "./usePreVerificationChecks";
import { usePostPurchaseHandler } from "./usePostPurchaseHandler";
import { useVerificationCoordinator } from "./verification/useVerificationCoordinator";

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
  const { handleVerificationFailure } = usePostPurchaseHandler();
  const { executeVerificationFlow } = useVerificationCoordinator();

  /**
   * Execute verification flow wrapper function that maintains the same API
   */
  const executeVerificationFlowWrapper = async (
    id: string | undefined, 
    options: {
      userId?: string;
      stripeSessionId?: string;
      isPostPurchase: boolean;
      storedResultId?: string;
      maxRetries: number;
    }
  ) => {
    try {
      console.log('Starting verification flow for:', { id, options });
      
      return await executeVerificationFlow(
        id,
        options,
        {
          verificationAttempts,
          startVerification,
          stopVerification
        },
        {
          setResult,
          setLoading,
          verifyPurchase
        }
      );
    } catch (error) {
      console.error('Verification flow error:', error);
      
      // Handle specific database error cases
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('infinite recursion') || errorMsg.includes('policy for relation')) {
        toast({
          title: "Database Access Error",
          description: "We're experiencing a temporary database issue. Our team has been notified.",
          variant: "destructive",
        });
      } else if (errorMsg.includes('Edge Function') || errorMsg.includes('non-2xx status')) {
        toast({
          title: "Server Error",
          description: "Our payment verification service is currently unavailable. Please try again later or contact support.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Error",
          description: "We encountered an error during verification. Please try again or contact support.",
          variant: "destructive",
        });
      }
      
      stopVerification();
      setLoading(false);
      return null;
    }
  };

  return {
    verifying,
    verificationAttempts,
    checkDirectAccess,
    showCreateAccountToast,
    executeVerificationFlow: executeVerificationFlowWrapper
  };
};
