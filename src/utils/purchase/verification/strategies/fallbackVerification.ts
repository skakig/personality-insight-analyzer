
/**
 * Fallback verification strategies when other methods fail
 */
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Force update purchase status as a last resort
 */
export const forceUpdatePurchaseStatus = async (resultId: string): Promise<QuizResult | null> => {
  try {
    console.log('[DEBUG] Force updating purchase status for result:', resultId);
    
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
      console.error('[ERROR] Force update error:', error);
      return null;
    }
    
    // Fetch updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result as QuizResult;
    }
    
    return null;
  } catch (error) {
    console.error('[ERROR] Force update error:', error);
    return null;
  }
};
