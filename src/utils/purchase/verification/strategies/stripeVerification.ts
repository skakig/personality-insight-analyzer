
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Verify purchase with Stripe session ID
 */
export const verifyWithStripeSession = async (resultId: string, sessionId: string) => {
  try {
    console.log('[DEBUG] Verifying purchase with Stripe session ID:', sessionId);
    
    // First check if result exists with this session ID
    const { data: result, error: fetchError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('[ERROR] Error fetching result with session ID:', fetchError);
      return null;
    }
      
    if (!result) {
      console.log('[DEBUG] No result found with session ID, trying to update...');
      
      // Try to update by setting session ID first
      try {
        const { error: updateError } = await supabase
          .from('quiz_results')
          .update({ stripe_session_id: sessionId })
          .eq('id', resultId);
          
        if (updateError) {
          console.error('[ERROR] Failed to update result with session ID:', updateError);
        } else {
          console.log('[DEBUG] Updated result with session ID');
        }
      } catch (e) {
        console.error('[ERROR] Exception updating session ID:', e);
      }
    } else {
      console.log('[DEBUG] Found result with session ID, purchase status:', result.purchase_status);
    }
    
    // Update to purchased if not already
    if (result && !isPurchased(result)) {
      console.log('[DEBUG] Updating result to purchased state');
      
      const { error: updateError } = await supabase
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
        
      if (updateError) {
        console.error('[ERROR] Session ID update error:', updateError);
        
        // If failed with session ID constraint, try direct update with just result ID
        console.log('[DEBUG] Attempting direct result ID update');
        const { error: directError } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            stripe_session_id: sessionId
          })
          .eq('id', resultId);
          
        if (directError) {
          console.error('[ERROR] Direct update error:', directError);
          return null;
        }
      }
      
      // Fetch updated result
      const { data: updatedResult, error: refetchError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (refetchError) {
        console.error('[ERROR] Error fetching updated result:', refetchError);
        return null;
      }
        
      if (updatedResult && isPurchased(updatedResult)) {
        console.log('[DEBUG] Updated result is now purchased');
        return updatedResult;
      } else if (updatedResult) {
        console.log('[DEBUG] Updated result still not marked as purchased:', {
          is_purchased: updatedResult.is_purchased,
          purchase_status: updatedResult.purchase_status
        });
      }
    } else if (result && isPurchased(result)) {
      console.log('[DEBUG] Result already marked as purchased');
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('[ERROR] Session ID verification error:', error);
    return null;
  }
};
