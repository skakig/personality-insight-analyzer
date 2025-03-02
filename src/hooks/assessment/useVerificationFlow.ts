import { useState, useCallback } from 'react';
import { useVerificationCoordinator } from './verification/useVerificationCoordinator';

export const useVerificationFlow = () => {
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  
  const {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    performStandardVerification,
    performLastResortVerification
  } = useVerificationCoordinator();
  
  const executeStandardVerification = useCallback(async (resultId: string) => {
    if (verificationInProgress) return false;
    
    try {
      setVerificationInProgress(true);
      setVerificationAttempts(prev => prev + 1);
      
      const success = await performStandardVerification();
      return success;
    } catch (error) {
      console.error('Verification flow error:', error);
      return false;
    } finally {
      setVerificationInProgress(false);
    }
  }, [verificationInProgress, performStandardVerification]);
  
  const executeLastResortVerification = useCallback(async (resultId: string) => {
    if (verificationInProgress) return false;
    
    try {
      setVerificationInProgress(true);
      
      const success = await performLastResortVerification();
      return success;
    } catch (error) {
      console.error('Last resort verification error:', error);
      return false;
    } finally {
      setVerificationInProgress(false);
    }
  }, [verificationInProgress, performLastResortVerification]);
  
  return {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    verificationAttempts,
    executeStandardVerification,
    executeLastResortVerification
  };
};
