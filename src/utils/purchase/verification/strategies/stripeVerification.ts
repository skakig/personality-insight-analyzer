
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Verify purchase with Stripe session ID
 */
export const verifyWithStripeSession = async (resultId: string, sessionId: string) => {
  try {
    console.log('Verifying purchase with Stripe session ID:', sessionId);
    
    // First check if result exists with this session ID
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with session ID');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        .eq('stripe_session_id', sessionId);
        
      if (error) {
        console.error('Session ID update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Session ID verification error:', error);
    return null;
  }
};
