
import { useState } from 'react';
import { verifyWithUserId, verifyWithStripeSession, forceUpdatePurchaseStatus } from '@/utils/purchase/verification/baseStrategies';

export const useVerificationCoordinator = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to update a result for a logged-in user
  const updateResultForUser = async (resultId: string, userId: string) => {
    try {
      setIsProcessing(true);
      const result = await verifyWithUserId(resultId, userId);
      return !!result;
    } catch (error) {
      console.error('Error in updateResultForUser:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to update a result using a Stripe session ID
  const updateResultWithSessionId = async (resultId: string, sessionId: string) => {
    try {
      setIsProcessing(true);
      const result = await verifyWithStripeSession(resultId, sessionId);
      return !!result;
    } catch (error) {
      console.error('Error in updateResultWithSessionId:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to try various fallback update strategies
  const tryFallbackUpdates = async ({ id, userId, sessionId, guestEmail }: { 
    id: string;
    userId?: string;
    sessionId?: string;
    guestEmail?: string;
  }) => {
    try {
      setIsProcessing(true);
      
      // Try various verification methods
      const result = await forceUpdatePurchaseStatus(id);
      return !!result;
    } catch (error) {
      console.error('Error in tryFallbackUpdates:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // For compatibility with existing code, provide the new function name
  const updateForCheckoutSuccess = async (id: string, userId?: string, sessionId?: string) => {
    if (userId) {
      return updateResultForUser(id, userId);
    } else if (sessionId) {
      return updateResultWithSessionId(id, sessionId);
    } else {
      return tryFallbackUpdates({ id });
    }
  };

  return { 
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates,
    updateForCheckoutSuccess
  };
};
