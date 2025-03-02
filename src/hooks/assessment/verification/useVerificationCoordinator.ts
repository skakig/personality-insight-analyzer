// Fix the errors in useVerificationCoordinator.ts
import { useState, useCallback } from 'react';
import { useVerificationStrategies } from './useVerificationStrategies';

export const useVerificationCoordinator = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const { 
    standardVerification, 
    fallbackVerification 
  } = useVerificationStrategies();

  // Fix calling with required parameters (dummy values for now - to be updated with actual implementation)
  const performStandardVerification = useCallback(() => standardVerification("", "", "", ""), [standardVerification]);
  const performLastResortVerification = useCallback(() => fallbackVerification("", "", "", ""), [fallbackVerification]);

  const runStandardVerification = useCallback(async (resultId: string, userId: string | null, trackingId: string | null, sessionId: string | null, guestToken: string | null, guestEmail: string | null) => {
    setIsVerifying(true);
    setVerificationComplete(false);
    setVerificationSuccess(false);
    
    try {
      const result = await standardVerification(resultId, userId, trackingId, sessionId, guestToken, guestEmail);
      
      if (result) {
        setVerificationSuccess(true);
      } else {
        setVerificationSuccess(false);
      }
      
      setVerificationComplete(true);
      return result;
    } catch (error) {
      console.error('Standard verification error:', error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [standardVerification]);

  const runFallbackVerification = useCallback(async (resultId: string) => {
    setIsVerifying(true);
    setVerificationComplete(false);
    setVerificationSuccess(false);
    
    try {
      const result = await fallbackVerification(resultId);
      
      if (result) {
        setVerificationSuccess(true);
      } else {
        setVerificationSuccess(false);
      }
      
      setVerificationComplete(true);
      return result;
    } catch (error) {
      console.error('Fallback verification error:', error);
      setVerificationSuccess(false);
      setVerificationComplete(true);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, [fallbackVerification]);

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
