
import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { cleanupPurchaseState } from "@/utils/purchaseStateUtils";

export const useVerifyPurchase = (
  setLoading: (value: boolean) => void,
  setResult: (result: any) => void,
  { startVerification, stopVerification, incrementAttempts }: {
    startVerification: () => void;
    stopVerification: () => void;
    incrementAttempts: () => void;
  }
) => {
  const verifyPurchase = async (id: string) => {
    startVerification();
    toast({
      title: "Verifying your purchase",
      description: "Please wait while we prepare your report...",
    });

    // Use the retry mechanism for post-purchase verification
    const verifiedResult = await verifyPurchaseWithRetry(id);
    
    if (verifiedResult) {
      setResult(verifiedResult);
      toast({
        title: "Purchase successful!",
        description: "Your detailed report is now available.",
      });
      setLoading(false);
      stopVerification();
      
      // Clear purchase-related localStorage
      cleanupPurchaseState();
      
      return true;
    } else {
      console.log('Purchase verification failed after retries');
      incrementAttempts();
      
      // The verification failed message is now handled in the main hook
      return false;
    }
  };

  return {
    verifyPurchase
  };
};
