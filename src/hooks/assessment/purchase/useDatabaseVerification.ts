
import { useVerificationDatabaseAccess } from "../verification/useVerificationDatabaseAccess";

/**
 * Handles direct database verification and updates
 */
export const useDatabaseVerification = () => {
  const { attemptDirectUpdate: updateDatabase } = useVerificationDatabaseAccess();
  
  /**
   * Attempts to directly update a result record in the database
   */
  const attemptDirectUpdate = async (options: {
    stripeSessionId: string;
    isPostPurchase: boolean;
    verificationId: string;
    userId?: string;
  }) => {
    const { stripeSessionId, isPostPurchase, verificationId, userId } = options;
    
    if (!isPostPurchase || !verificationId) {
      console.log('Direct update skipped - not a post-purchase state or missing verification ID');
      return null;
    }
    
    return await updateDatabase(verificationId, userId, stripeSessionId);
  };

  return {
    attemptDirectUpdate
  };
};
