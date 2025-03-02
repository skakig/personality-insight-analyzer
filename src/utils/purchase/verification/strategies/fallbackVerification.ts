
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Force update purchase status as a last resort
 */
export const forceUpdatePurchaseStatus = async (resultId: string) => {
  try {
    console.log('Force updating purchase status for result:', resultId);
    
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'forced_update'
      })
      .eq('id', resultId);
      
    if (error) {
      console.error('Force update error:', error);
      return null;
    }
    
    // Fetch updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Force update error:', error);
    return null;
  }
};
