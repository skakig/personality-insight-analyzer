
import { useState } from 'react';
import { useDatabaseUpdateStrategies } from './useDatabaseUpdateStrategies';
import { useFallbackVerificationStrategies } from './useFallbackVerificationStrategies';
import { useStandardVerification } from './useStandardVerification';

export const useVerificationCoordinator = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const databaseStrategies = useDatabaseUpdateStrategies();
  const fallbackStrategies = useFallbackVerificationStrategies();
  const standardVerification = useStandardVerification();

  // Create aliases for backward compatibility
  const updateResultForUser = databaseStrategies.updateResultForUser;
  const updateResultWithSessionId = databaseStrategies.updateResultWithSessionId;
  const tryFallbackUpdates = fallbackStrategies.tryFallbackUpdates;
  
  // Implement standard verification flow
  const runStandardVerification = async (
    resultId: string,
    userId?: string,
    trackingId?: string,
    sessionId?: string,
    guestToken?: string,
    guestEmail?: string
  ) => {
    setIsVerifying(true);
    setVerificationComplete(false);
    setVerificationSuccess(false);
    
    try {
      // Try all available strategies
      let result = null;
      
      if (userId) {
        result = await updateResultForUser(resultId, userId);
      }
      
      if (!result && sessionId) {
        result = await updateResultWithSessionId(resultId, sessionId);
      }
      
      if (!result) {
        result = await tryFallbackUpdates({ 
          id: resultId, 
          userId, 
          sessionId, 
          guestEmail 
        });
      }
      
      setVerificationSuccess(!!result);
      return result;
    } catch (error) {
      console.error('Standard verification error:', error);
      return null;
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  };
  
  // Implement fallback verification
  const runFallbackVerification = async (resultId: string) => {
    setIsVerifying(true);
    setVerificationComplete(false);
    setVerificationSuccess(false);
    
    try {
      const result = await fallbackStrategies.tryFallbackUpdates({ id: resultId });
      setVerificationSuccess(!!result);
      return result;
    } catch (error) {
      console.error('Fallback verification error:', error);
      return null;
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  };

  return {
    // Original methods
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates,
    
    // New methods
    runStandardVerification,
    runFallbackVerification,
    
    // State
    isVerifying,
    verificationComplete,
    verificationSuccess
  };
};
