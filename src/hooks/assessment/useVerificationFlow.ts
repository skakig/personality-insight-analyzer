
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useVerificationState } from "./useVerificationState";
import { useVerifyPurchase } from "./useVerifyPurchase";
import { usePreVerificationChecks } from "./usePreVerificationChecks";
import { usePostPurchaseHandler } from "./usePostPurchaseHandler";
import { supabase } from "@/integrations/supabase/client";

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
   * Check if the user is returning from a successful Stripe checkout
   * and try to immediately validate the purchase
   */
  const handleStripeReturn = async (resultId: string, options?: { userId?: string, sessionId?: string }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id') || options?.sessionId;
    
    if (success && sessionId) {
      console.log('Detected return from Stripe checkout:', {
        resultId,
        sessionId,
        userId: options?.userId || 'guest'
      });
      
      try {
        // For logged-in users, directly update the purchase status
        if (options?.userId) {
          console.log('Attempting direct database update for logged-in user with session ID:', sessionId);
          
          // First try updating with both result ID and user ID which is most reliable
          const { error: userError } = await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              stripe_session_id: sessionId
            })
            .eq('id', resultId)
            .eq('user_id', options.userId);
            
          if (!userError) {
            console.log('Successfully updated quiz result for user:', options.userId);
            
            // Also update purchase_tracking record if it exists
            try {
              await supabase
                .from('purchase_tracking')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  stripe_session_id: sessionId
                })
                .eq('quiz_result_id', resultId)
                .eq('user_id', options.userId);
              
              console.log('Updated related purchase tracking record');
            } catch (trackingError) {
              console.log('Non-critical error updating tracking record:', trackingError);
            }
            
            // Fetch the updated result
            const { data: result } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', resultId)
              .eq('user_id', options.userId)
              .maybeSingle();
              
            if (result) {
              console.log('Successfully fetched updated result after purchase');
              // Clear URL parameters to prevent repeat processing
              window.history.replaceState({}, document.title, window.location.pathname);
              return result;
            }
          } else {
            console.error('Failed to update purchase status:', userError);
            
            // Fallback: try updating with session ID if user ID update failed
            if (sessionId) {
              const { error: sessionError } = await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase',
                  stripe_session_id: sessionId
                })
                .eq('id', resultId)
                .eq('stripe_session_id', sessionId);
                
              if (!sessionError) {
                console.log('Successfully updated with session ID:', sessionId);
                const { data: sessionResult } = await supabase
                  .from('quiz_results')
                  .select('*')
                  .eq('id', resultId)
                  .eq('stripe_session_id', sessionId)
                  .maybeSingle();
                  
                if (sessionResult) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  return sessionResult;
                }
              } else {
                console.error('Session ID update also failed:', sessionError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling Stripe return:', error);
      }
    }
    
    return null;
  };

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
    
    // First, try to handle direct return from Stripe
    if (isPostPurchase || stripeSessionId) {
      const stripeReturnResult = await handleStripeReturn(verificationId, {
        userId, 
        sessionId: stripeSessionId
      });
      
      if (stripeReturnResult) {
        console.log('Successfully processed Stripe return directly');
        setResult(stripeReturnResult);
        setLoading(false);
        return stripeReturnResult;
      }
    }
    
    // Last resort - attempt direct update if all else fails
    if (verificationAttempts >= 1 && userId) {
      console.log('Attempting direct database update as fallback for logged-in user');
      
      // Fallback direct update bypassing verification process
      const { error } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', verificationId);
        
      if (!error) {
        console.log('Direct fallback update succeeded');
        const { data: directResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', verificationId)
          .maybeSingle();
          
        if (directResult) {
          setResult(directResult);
          setLoading(false);
          stopVerification();
          return directResult;
        }
      } else {
        console.error('Direct fallback update failed:', error);
      }
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
    
    // Standard verification attempt
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
