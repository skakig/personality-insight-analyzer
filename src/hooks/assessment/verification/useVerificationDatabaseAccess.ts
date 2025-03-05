
import { useDatabaseUpdateStrategies } from "./useDatabaseUpdateStrategies";
import { useResultFetchingStrategies } from "./useResultFetchingStrategies";
import { usePurchaseTrackingUpdates } from "./usePurchaseTrackingUpdates";

/**
 * Coordinates database access during verification process
 */
export const useVerificationDatabaseAccess = () => {
  const { updateForCheckoutSuccess } = useDatabaseUpdateStrategies();
  const { fetchResult } = useResultFetchingStrategies();
  const { updatePurchaseTracking } = usePurchaseTrackingUpdates();
  
  /**
   * Attempts to directly update a result record in the database
   */
  const attemptDirectUpdate = async (
    verificationId: string,
    userId?: string,
    stripeSessionId?: string | null
  ) => {
    if (!verificationId) {
      console.log('Direct update skipped - missing verification ID');
      return null;
    }
    
    try {
      console.log('Attempting direct database update for verification', {
        verificationId,
        userId,
        hasSessionId: !!stripeSessionId
      });
      
      // Try to update the record
      const success = await updateForCheckoutSuccess(
        verificationId, 
        userId, 
        stripeSessionId
      );
      
      if (success) {
        // Update purchase tracking if applicable
        if (stripeSessionId) {
          await updatePurchaseTracking(verificationId, stripeSessionId);
        }
        
        // Fetch the updated result
        const result = await fetchResult(verificationId, userId, stripeSessionId);
        return result;
      }
    } catch (error) {
      console.error('Final manual update failed:', error);
    }
    
    return null;
  };

  return {
    attemptDirectUpdate
  };
};
