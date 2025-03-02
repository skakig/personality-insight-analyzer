import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { getStoredPurchaseData } from "@/utils/purchaseStateUtils";

// Import the missing function
import { updateResultWithPurchase } from "@/utils/purchaseVerification";

export const useBasicVerificationStrategies = () => {
  // Quick verification for users just returning from Stripe
  const quickStripeVerification = async (resultId: string) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success') === 'true';
      const { stripeSessionId } = getStoredPurchaseData();
      
      if (success && stripeSessionId && resultId) {
        // Use the imported function
        const updated = await updateResultWithPurchase(resultId, stripeSessionId);
        
        if (updated) {
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (result && isPurchased(result)) {
            return result;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in quick verification:', error);
      return null;
    }
  };

  return {
    quickStripeVerification,
  };
};
