
import { useCallback } from "react";
import { useStandardVerification } from "./useStandardVerification";
import { useFallbackVerificationStrategies } from "./useFallbackVerificationStrategies";

/**
 * Coordinates different verification strategies
 */
export const useVerificationCoordinator = () => {
  const standardVerification = useStandardVerification();
  const fallbackVerification = useFallbackVerificationStrategies();
  
  const performStandardVerification = useCallback(async (id: string, sessionId?: string, userId?: string) => {
    if (!id) return false;
    
    try {
      console.log('Performing standard verification:', { id, sessionId, userId });
      return await standardVerification.performStandardVerification(id, sessionId, userId);
    } catch (error) {
      console.error('Standard verification failed:', error);
      return false;
    }
  }, [standardVerification]);
  
  const performLastResortVerification = useCallback(async (id: string, userId?: string, sessionId?: string) => {
    if (!id) return false;
    
    try {
      console.log('Performing last resort verification:', { id, userId, sessionId });
      return await fallbackVerification.performLastResortVerification(id, userId, sessionId);
    } catch (error) {
      console.error('Last resort verification failed:', error);
      return false;
    }
  }, [fallbackVerification]);
  
  return {
    performStandardVerification,
    performLastResortVerification
  };
};
