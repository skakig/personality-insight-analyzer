
import { useDatabaseUpdateStrategies } from './useDatabaseUpdateStrategies';
import { useStandardVerification } from './useStandardVerification';

export const useVerificationCoordinator = () => {
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
        return result;
      }
      
      console.log('Standard verification failed, trying fallback');
      
      // Try fallback verification
      const fallbackResult = await standardVerification.performLastResortVerification(resultId);
      
      if (fallbackResult) {
        console.log('Fallback verification successful');
        return fallbackResult;
      }
      
      console.log('All verification attempts failed');
      return null;
    } catch (error) {
      console.error('Verification sequence error:', error);
      return null;
    }
  };
  
  return {
    runVerificationSequence,
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates,
    ...databaseStrategies
  };
};
