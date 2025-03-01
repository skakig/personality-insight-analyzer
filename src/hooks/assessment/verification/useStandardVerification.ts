
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { toast } from "@/hooks/use-toast";

/**
 * Handles standard verification with retries
 */
export const useStandardVerification = (
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  stopVerification: () => void,
  incrementAttempts: () => void,
) => {
  /**
   * Standard verification flow with retries
   */
  const performStandardVerification = async (id: string, sessionId?: string | null, userId?: string) => {
    console.log('Attempting standard purchase verification with retries');
    const verifiedResult = await verifyPurchaseWithRetry(id, 8, 1000);
    
    if (verifiedResult) {
      console.log('Purchase verified successfully through standard verification!');
      setResult(verifiedResult);
      toast({
        title: "Purchase successful!",
        description: "Your detailed report is now available.",
      });
      setLoading(false);
      stopVerification();
      
      // Store the result ID correctly
      storePurchaseData(id, sessionId || '', userId);
      
      return true;
    } else {
      console.log('Purchase verification failed after retries');
      incrementAttempts();
      return false;
    }
  };
  
  return {
    performStandardVerification
  };
};
