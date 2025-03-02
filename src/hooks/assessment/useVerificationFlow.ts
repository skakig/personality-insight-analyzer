
import { useState, useCallback } from "react";
import { useVerificationCoordinator } from "./verification/useVerificationCoordinator";

/**
 * Hook for managing verification flow state and operations
 */
export const useVerificationFlow = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const coordinator = useVerificationCoordinator();
  
  const runVerification = useCallback(async (id: string, sessionId?: string, userId?: string) => {
    if (!id) return false;
    
    setIsVerifying(true);
    setVerificationComplete(false);
    
    try {
      const success = await coordinator.performStandardVerification(id, sessionId, userId);
      
      setVerificationSuccess(success);
      setVerificationComplete(true);
      return success;
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [coordinator]);
  
  const runFallbackVerification = useCallback(async (id: string) => {
    if (!id) return false;
    
    setIsVerifying(true);
    
    try {
      const success = await coordinator.performLastResortVerification(id);
      
      setVerificationSuccess(success);
      setVerificationComplete(true);
      return success;
    } catch (error) {
      console.error('Fallback verification error:', error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [coordinator]);
  
  return {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runVerification,
    runFallbackVerification
  };
};
