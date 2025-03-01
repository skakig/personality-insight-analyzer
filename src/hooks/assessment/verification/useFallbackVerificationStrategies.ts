
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Provides fallback verification strategies when primary methods fail
 */
export const useFallbackVerificationStrategies = (
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  stopVerification: () => void,
  incrementAttempts: () => void
) => {
  /**
   * Try standard verification with retries
   */
  const performStandardVerification = async (id: string, sessionId?: string | null, userId?: string) => {
    console.log('Fallback strategy: Attempting standard verification with retries');
    const verifiedResult = await verifyPurchaseWithRetry(id, 8, 1000);
    
    if (verifiedResult) {
      console.log('Standard verification successful!');
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
    }
    
    console.log('Standard verification failed');
    incrementAttempts();
    return false;
  };
  
  /**
   * Final attempt to update database directly for last-resort verification
   */
  const performLastResortVerification = async (id: string, userId?: string, sessionId?: string | null) => {
    console.log('Last resort strategy: Direct database update');
    
    // Try without any filters
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Last resort update failed:', updateError);
      return false;
    }
    
    // Fetch the updated result
    const { data: finalResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (finalResult) {
      console.log('Last resort verification successful!');
      setResult(finalResult);
      setLoading(false);
      stopVerification();
      toast({
        title: "Purchase verified!",
        description: "Your detailed report is now available.",
      });
      
      if (sessionId) {
        storePurchaseData(id, sessionId, userId);
      }
      
      return true;
    }
    
    return false;
  };
  
  return {
    performStandardVerification,
    performLastResortVerification
  };
};
