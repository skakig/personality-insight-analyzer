
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { useVerificationDatabaseAccess } from "../verification/useVerificationDatabaseAccess";

export const useDatabaseVerification = () => {
  const databaseAccess = useVerificationDatabaseAccess();
  
  const verifyDatabasePurchase = async (resultId: string, userId?: string, sessionId?: string) => {
    try {
      // Try to verify with user ID
      if (userId) {
        const { data: userResult } = await databaseAccess.fetchUserResult(resultId, userId);
        if (userResult && isPurchased(userResult)) {
          return userResult;
        }
      }
      
      // Try to verify with session ID
      if (sessionId) {
        const { data: sessionResult } = await databaseAccess.fetchResultBySessionId(resultId, sessionId);
        if (sessionResult && isPurchased(sessionResult)) {
          return sessionResult;
        }
      }
      
      // Direct check by result ID
      const { data: directResult } = await databaseAccess.fetchUserResult(resultId);
      if (directResult && isPurchased(directResult)) {
        return directResult;
      }
      
      return null;
    } catch (error) {
      console.error('Database verification error:', error);
      return null;
    }
  };
  
  const updatePurchaseStatus = async (resultId: string, options?: { userId?: string, sessionId?: string }) => {
    return await databaseAccess.markResultAsPurchased(resultId, options);
  };
  
  return {
    verifyDatabasePurchase,
    updatePurchaseStatus
  };
};
