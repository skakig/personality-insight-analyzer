
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
      
      if (userId && databaseStrategies.updateResultForUser) {
        result = await databaseStrategies.updateResultForUser(resultId, userId);
      }
      
      if (!result && sessionId && databaseStrategies.updateResultWithSessionId) {
        result = await databaseStrategies.updateResultWithSessionId(resultId, sessionId);
      }
      
      if (!result && fallbackStrategies.tryFallbackUpdates) {
        result = await fallbackStrategies.tryFallbackUpdates({ 
          id: resultId, 
          userId, 
          sessionId, 
          guestEmail 
        });
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
      if (fallbackStrategies.tryFallbackUpdates) {
        return await fallbackStrategies.tryFallbackUpdates({ id: resultId });
      }
      return null;
    } catch (error) {
      console.error('Fallback verification error:', error);
      return null;
    }
  };

  return {
    performStandardVerification,
    performLastResortVerification
  };
};
