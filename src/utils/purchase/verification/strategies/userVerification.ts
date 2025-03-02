
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Verify purchase with user ID
 */
export const verifyWithUserId = async (resultId: string, userId: string) => {
  try {
    console.log('Verifying purchase with user ID:', userId);
    
    // Update the result as purchased
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', resultId)
      .eq('user_id', userId);
      
    if (error) {
      console.error('User verification update error:', error);
      return null;
    }
    
    // Fetch the updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('User verification error:', error);
    return null;
  }
};
