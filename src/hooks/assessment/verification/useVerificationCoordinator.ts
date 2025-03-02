
import { useState } from "react";
import { useDatabaseUpdateStrategies } from "./useDatabaseUpdateStrategies";

export const useVerificationCoordinator = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const { 
    updateResultForUser, 
    updateResultWithSessionId, 
    tryFallbackUpdates 
  } = useDatabaseUpdateStrategies();
  
  // Add these methods to match what's being called in other files
  const performStandardVerification = async (resultId: string, userId?: string, trackingId?: string, sessionId?: string, guestToken?: string, guestEmail?: string) => {
    try {
      setIsVerifying(true);
      // Implement verification logic or delegate to other methods
      // For example:
      let success = false;
      
      if (userId) {
        success = await updateResultForUser(resultId, userId);
      }
      
      if (!success && sessionId) {
        success = await updateResultWithSessionId(resultId, sessionId);
      }
      
      if (!success && (userId || sessionId || guestEmail)) {
        success = await tryFallbackUpdates({ 
          id: resultId, 
          userId, 
          sessionId, 
          guestEmail 
        });
      }
      
      setVerificationSuccess(success);
      setVerificationComplete(true);
      return success;
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  const performLastResortVerification = async (resultId: string) => {
    try {
      setIsVerifying(true);
      const success = await tryFallbackUpdates({ id: resultId });
      setVerificationSuccess(success);
      setVerificationComplete(true);
      return success;
    } catch (error) {
      console.error("Last resort verification error:", error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  // These are the methods we'll use for consistency
  const runStandardVerification = async (resultId: string, userId?: string, trackingId?: string, sessionId?: string, guestToken?: string, guestEmail?: string) => {
    return performStandardVerification(resultId, userId, trackingId, sessionId, guestToken, guestEmail);
  };
  
  const runFallbackVerification = async (resultId: string) => {
    return performLastResortVerification(resultId);
  };
  
  return {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    performStandardVerification,
    performLastResortVerification,
    runStandardVerification,
    runFallbackVerification
  };
};
