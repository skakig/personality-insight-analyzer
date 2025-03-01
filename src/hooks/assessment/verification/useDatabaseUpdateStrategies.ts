
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides strategies for direct database updates during verification
 */
export const useDatabaseUpdateStrategies = () => {
  /**
   * Update database for users returning from successful Stripe checkout
   */
  const updateForCheckoutSuccess = async (id: string, userId?: string, sessionId?: string | null) => {
    console.log('Updating database for checkout success', { id, userId, sessionId });
    
    try {
      // For logged-in users
      if (userId) {
        const { error: userError } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id)
          .eq('user_id', userId);
        
        if (!userError) {
          return true;
        }
        
        console.error('User update error:', userError);
      }
      
      // For session ID-based updates
      if (sessionId) {
        // First try to synchronize the session ID
        try {
          await supabase
            .from('quiz_results')
            .update({ stripe_session_id: sessionId })
            .eq('id', id);
        } catch (syncError) {
          console.error('Session sync error (non-critical):', syncError);
        }
        
        // Then update the purchase status
        const { error: sessionError } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            stripe_session_id: sessionId
          })
          .eq('id', id)
          .eq('stripe_session_id', sessionId);
        
        if (!sessionError) {
          return true;
        }
        
        console.error('Session update error:', sessionError);
      }
      
      // Direct update without filters as last resort
      const { error: directError } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', id);
      
      if (!directError) {
        return true;
      }
      
      console.error('Direct update error:', directError);
      return false;
    } catch (error) {
      console.error('Database update error:', error);
      return false;
    }
  };
  
  return {
    updateForCheckoutSuccess
  };
};
