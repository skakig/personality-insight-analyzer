import { supabase } from "@/integrations/supabase/client";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";

export const useFallbackVerificationStrategies = () => {
  const executeRetry = async (resultId: string) => {
    try {
      return await verifyPurchaseWithRetry(resultId, 3);
    } catch (error) {
      console.error('Error in verification retry:', error);
      return null;
    }
  };

  return {
    executeRetry,
  };
};
