
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
    return executeVerificationFlow(
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
  };

  return {
    verifying,
    verificationAttempts,
    checkDirectAccess,
    showCreateAccountToast,
    executeVerificationFlow: executeVerificationFlowWrapper
  };
};
