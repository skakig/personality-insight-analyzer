
import { useDatabaseUpdateStrategies } from './useDatabaseUpdateStrategies';
import { useStandardVerification } from './useStandardVerification';
import { useState } from 'react';

export const useVerificationCoordinator = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const databaseStrategies = useDatabaseUpdateStrategies();
  const standardVerification = useStandardVerification();
  
  // Add compatibility methods
  const updateResultForUser = async (resultId: string, userId: string) => {
    return await databaseStrategies.updateForCheckoutSuccess(resultId, userId, undefined);
  };
  
  const updateResultWithSessionId = async (resultId: string, sessionId: string) => {
    return await databaseStrategies.updateForCheckoutSuccess(resultId, undefined, sessionId);
  };
  
  const tryFallbackUpdates = async ({ id, userId, sessionId, guestEmail }: { 
    id: string, 
    userId?: string, 
    sessionId?: string, 
    guestEmail?: string 
  }) => {
    return await standardVerification.performLastResortVerification(id);
  };
  
  // Run verification in a sequence of attempts
  const runVerificationSequence = async (
    resultId: string,
    userId?: string,
    trackingId?: string,
    sessionId?: string, 
    guestToken?: string,
    guestEmail?: string
  ) => {
    try {
      setIsVerifying(true);
      setVerificationComplete(false);
      setVerificationSuccess(false);
      
      console.log('Starting verification sequence for result:', resultId);
      
      // Try standard verification
      const result = await standardVerification.performStandardVerification(
        resultId,
        userId,
        trackingId,
        sessionId,
        guestToken,
        guestEmail
      );
      
      if (result) {
        console.log('Standard verification successful');
        setVerificationSuccess(true);
        setVerificationComplete(true);
        setIsVerifying(false);
        return result;
      }
      
      console.log('Standard verification failed, trying fallback');
      
      // Try fallback verification
      const fallbackResult = await standardVerification.performLastResortVerification(resultId);
      
      setVerificationComplete(true);
      setIsVerifying(false);
      
      if (fallbackResult) {
        console.log('Fallback verification successful');
        setVerificationSuccess(true);
        return fallbackResult;
      }
      
      console.log('All verification attempts failed');
      return null;
    } catch (error) {
      console.error('Verification sequence error:', error);
      setVerificationComplete(true);
      setIsVerifying(false);
      return null;
    }
  };
  
  // Standard verification for simpler interfaces
  const runStandardVerification = async (
    resultId: string,
    userId?: string,
    trackingId?: string,
    sessionId?: string,
    guestToken?: string,
    guestEmail?: string
  ) => {
    setIsVerifying(true);
    try {
      const result = await standardVerification.performStandardVerification(
        resultId,
        userId,
        trackingId,
        sessionId,
        guestToken,
        guestEmail
      );
      
      setVerificationSuccess(!!result);
      return result;
    } finally {
      setVerificationComplete(true);
      setIsVerifying(false);
    }
  };
  
  // Fallback verification for simpler interfaces
  const runFallbackVerification = async (resultId: string) => {
    setIsVerifying(true);
    try {
      const result = await standardVerification.performLastResortVerification(resultId);
      setVerificationSuccess(!!result);
      return result;
    } finally {
      setVerificationComplete(true);
      setIsVerifying(false);
    }
  };
  
  return {
    runVerificationSequence,
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates,
    runStandardVerification,
    runFallbackVerification,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    ...databaseStrategies
  };
};
