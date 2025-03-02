
import { useState } from "react";
import { useVerificationCoordinator } from "./verification/useVerificationCoordinator";

export const useVerificationFlow = () => {
  const {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runStandardVerification,
    runFallbackVerification
  } = useVerificationCoordinator();

  const runVerification = async (resultId: string, sessionId?: string, userId?: string) => {
    console.log('Running verification with:', { resultId, sessionId, userId });
    
    try {
      // Use renamed methods
      const verificationResult = await runStandardVerification(
        resultId,
        userId,
        undefined, // trackingId
        sessionId,
        undefined, // guestToken
        undefined  // guestEmail
      );
      
      console.log('Verification result:', verificationResult);
      return verificationResult;
    } catch (error) {
      console.error("Verification flow error:", error);
      return false;
    }
  };

  const executeLastResortVerification = async (resultId: string) => {
    console.log('Running last resort verification for:', resultId);
    
    try {
      // Use renamed method
      const fallbackResult = await runFallbackVerification(resultId);
      console.log('Fallback verification result:', fallbackResult);
      return fallbackResult;
    } catch (error) {
      console.error("Last resort verification error:", error);
      return false;
    }
  };

  return {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runVerification,
    runFallbackVerification: executeLastResortVerification
  };
};
