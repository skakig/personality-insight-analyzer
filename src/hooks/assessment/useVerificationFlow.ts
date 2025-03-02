
import { useVerificationCoordinator } from './verification/useVerificationCoordinator';
import { useState } from 'react';

export const useVerificationFlow = () => {
  const coordinator = useVerificationCoordinator();
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  // Add properties from coordinator
  const isVerifying = coordinator.isVerifying;
  const verificationComplete = coordinator.verificationComplete;
  const verificationSuccess = coordinator.verificationSuccess;
  
  // Add runVerification method
  const runVerification = async (resultId: string, sessionId?: string, userId?: string) => {
    setVerificationAttempts(prev => prev + 1);
    
    try {
      // Use the appropriate method from coordinator
      if (coordinator.runStandardVerification) {
        return await coordinator.runStandardVerification(resultId, userId, undefined, sessionId);
      }
      
      // Fallback to other methods for backward compatibility
      if (userId) {
        return await coordinator.updateResultForUser(resultId, userId);
      }
      
      if (sessionId) {
        return await coordinator.updateResultWithSessionId(resultId, sessionId);
      }
      
      return null;
    } catch (error) {
      console.error('Verification error:', error);
      return null;
    }
  };
  
  // Add runFallbackVerification method
  const runFallbackVerification = async (resultId: string) => {
    try {
      // Use the appropriate method from coordinator
      if (coordinator.runFallbackVerification) {
        return await coordinator.runFallbackVerification(resultId);
      }
      
      // Fallback to other methods for backward compatibility
      return await coordinator.tryFallbackUpdates({ id: resultId });
    } catch (error) {
      console.error('Fallback verification error:', error);
      return null;
    }
  };

  return {
    // Original methods from coordinator
    ...coordinator,
    
    // New methods specific to this hook
    runVerification,
    runFallbackVerification,
    verificationAttempts
  };
};
