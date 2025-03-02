
import { useState } from "react";
import { useVerificationCoordinator } from "./verification/useVerificationCoordinator";

export const useVerificationFlow = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const coordinator = useVerificationCoordinator();

  // Add missing state properties to coordinator
  const enhancedCoordinator = {
    ...coordinator,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runStandardVerification: coordinator.updateResultForUser || coordinator.updateForCheckoutSuccess,
    runFallbackVerification: coordinator.tryFallbackUpdates
  };

  const runVerification = async (resultId: string, sessionId?: string, userId?: string) => {
    console.log('Running verification with:', { resultId, sessionId, userId });
    
    setIsVerifying(true);
    setVerificationComplete(false);
    setVerificationSuccess(false);
    
    try {
      // Use whatever method is available
      const verificationMethod = enhancedCoordinator.runStandardVerification || coordinator.updateForCheckoutSuccess;
      const verificationResult = await verificationMethod(
        resultId,
        userId,
        sessionId
      );
      
      setVerificationSuccess(!!verificationResult);
      console.log('Verification result:', verificationResult);
      return verificationResult;
    } catch (error) {
      console.error("Verification flow error:", error);
      return false;
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  };

  const executeLastResortVerification = async (resultId: string) => {
    console.log('Running last resort verification for:', resultId);
    
    setIsVerifying(true);
    
    try {
      // Use whatever method is available
      const fallbackMethod = enhancedCoordinator.runFallbackVerification || coordinator.tryFallbackUpdates;
      const fallbackResult = await fallbackMethod({
        id: resultId
      });
      
      setVerificationSuccess(!!fallbackResult);
      console.log('Fallback verification result:', fallbackResult);
      return fallbackResult;
    } catch (error) {
      console.error("Last resort verification error:", error);
      return false;
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
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
