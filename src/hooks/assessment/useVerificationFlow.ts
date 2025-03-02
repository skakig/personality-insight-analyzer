
import { useState } from 'react';
import { useVerificationCoordinator } from './verification/useVerificationCoordinator';
import { QuizResult } from '@/types/quiz';

export const useVerificationFlow = () => {
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const verification = useVerificationCoordinator();
  
  // Destructure the values we need
  const { 
    isVerifying, 
    verificationComplete, 
    verificationSuccess,
    runStandardVerification,
    runFallbackVerification,
    runVerificationSequence
  } = verification;

  const runVerification = async (
    resultId: string, 
    sessionId?: string, 
    userId?: string
  ) => {
    setVerificationAttempts(prev => prev + 1);
    
    try {
      return await runStandardVerification(
        resultId,
        userId,
        undefined,
        sessionId
      );
    } catch (error) {
      console.error('Verification error:', error);
      return null;
    }
  };

  // Verify purchase with multiple retries
  const verifyPurchase = async (
    resultId: string,
    maxRetries = 3
  ): Promise<QuizResult | null> => {
    setVerificationAttempts(prev => prev + 1);
    
    try {
      // First try standard verification
      const standardResult = await runStandardVerification(resultId);
      
      if (standardResult) {
        return standardResult;
      }
      
      // If standard verification fails, try fallback
      return await runFallbackVerification(resultId);
    } catch (error) {
      console.error('Purchase verification error:', error);
      return null;
    }
  };

  return {
    runVerification,
    verifyPurchase,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    verificationAttempts,
    ...verification
  };
};
