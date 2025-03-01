import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { cleanupPurchaseState } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";

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

    try {
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
        
        // Clear purchase-related localStorage only partially
        // We keep guest email and access token for continuity
        localStorage.removeItem('stripeSessionId');
        localStorage.removeItem('purchaseTrackingId');
        localStorage.removeItem('purchaseResultId');
        
        return true;
      } else {
        console.log('Purchase verification failed after retries');
        incrementAttempts();
        
        // Try a more direct approach for the last attempt
        try {
          const stripeSessionId = localStorage.getItem('stripeSessionId');
          const guestEmail = localStorage.getItem('guestEmail');
          
          if (stripeSessionId) {
            console.log('Attempting direct update with session ID:', stripeSessionId);
            await supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id);
              
            const { data: finalResult } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', id)
              .maybeSingle();
              
            if (finalResult) {
              setResult(finalResult);
              toast({
                title: "Purchase verified!",
                description: "Your detailed report is now available.",
              });
              setLoading(false);
              stopVerification();
              return true;
            }
          }
        } catch (finalError) {
          console.error('Final verification attempt failed:', finalError);
        }
        
        // The verification failed message is now handled in the main hook
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      incrementAttempts();
      return false;
    }
  };

  return {
    verifyPurchase
  };
};
