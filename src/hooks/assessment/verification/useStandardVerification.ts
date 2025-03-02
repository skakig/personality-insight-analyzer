
import { useDatabaseUpdateStrategies } from './useDatabaseUpdateStrategies';
import { useFallbackVerificationStrategies } from './useFallbackVerificationStrategies';

export const useStandardVerification = () => {
  const databaseStrategies = useDatabaseUpdateStrategies();
  const fallbackStrategies = useFallbackVerificationStrategies();
  
  // Implement standard verification flow
  const performStandardVerification = async (
    resultId: string,
    userId?: string,
    trackingId?: string,
    sessionId?: string,
    guestToken?: string,
    guestEmail?: string
  ) => {
    try {
      // Try all available strategies
      let result = null;
      
      // Add compatibility methods
      const updateResultForUser = async (id: string, userId: string) => {
        return await databaseStrategies.updateForCheckoutSuccess(id, userId, undefined);
      };
      
      const updateResultWithSessionId = async (id: string, sessionId: string) => {
        return await databaseStrategies.updateForCheckoutSuccess(id, undefined, sessionId);
      };
      
      // Directly use the method we know exists
      if (userId && userId.length > 0) {
        result = await updateResultForUser(resultId, userId);
      }
      
      if (!result && sessionId && sessionId.length > 0) {
        result = await updateResultWithSessionId(resultId, sessionId);
      }
      
      if (!result && fallbackStrategies.performStandardVerification) {
        result = await fallbackStrategies.performStandardVerification(resultId, sessionId, userId);
      }
      
      return result;
    } catch (error) {
      console.error('Standard verification error:', error);
      return null;
    }
  };
  
  // Implement fallback verification
  const performLastResortVerification = async (resultId: string) => {
    try {
      if (fallbackStrategies.performLastResortVerification) {
        return await fallbackStrategies.performLastResortVerification(resultId);
      }
      return null;
    } catch (error) {
      console.error('Fallback verification error:', error);
      return null;
    }
  };

  // Add compatibility methods
  const tryFallbackUpdates = async ({ id, userId, sessionId, guestEmail }: { 
    id: string, 
    userId?: string, 
    sessionId?: string, 
    guestEmail?: string 
  }) => {
    if (fallbackStrategies.performLastResortVerification) {
      return await fallbackStrategies.performLastResortVerification(id);
    }
    return null;
  };

  return {
    performStandardVerification,
    performLastResortVerification,
    tryFallbackUpdates // Add compatibility method
  };
};
