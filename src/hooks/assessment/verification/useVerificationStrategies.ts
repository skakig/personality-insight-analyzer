
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Provides strategies for direct database updates during purchase verification
 */
export const useVerificationStrategies = () => {
  
  /**
   * Attempts to update a result for a specific user
   */
  const updateResultForUser = async (resultId: string, userId: string) => {
    try {
      console.log('Attempting to update result for user:', { resultId, userId });
      
      const { error } = await supabase
        .from('quiz_results')
        .update({
          user_id: userId,
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
        
      if (error) {
        console.error('Error updating result for user:', error);
        return false;
      }
      
      console.log('Successfully updated result for user');
      return true;
    } catch (error) {
      console.error('Exception during user result update:', error);
      return false;
    }
  };
  
  /**
   * Attempts to update a result with a specific session ID
   */
  const updateResultWithSessionId = async (resultId: string, sessionId: string) => {
    try {
      console.log('Attempting to update result with session ID:', { resultId, sessionId });
      
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
        console.error('Error updating result with session ID:', error);
        return false;
      }
      
      console.log('Successfully updated result with session ID');
      return true;
    } catch (error) {
      console.error('Exception during session result update:', error);
      return false;
    }
  };
  
  /**
   * Attempts various fallback update strategies
   */
  const tryFallbackUpdates = async ({ 
    id, 
    userId, 
    sessionId, 
    guestEmail 
  }: { 
    id: string; 
    userId?: string | null; 
    sessionId?: string | null; 
    guestEmail?: string | null; 
  }) => {
    try {
      console.log('Attempting fallback updates with:', { id, userId, sessionId, guestEmail });
      
      // Try each strategy in succession
      let updateSuccess = false;
      
      // 1. Try with User ID if available
      if (userId) {
        const { error } = await supabase
          .from('quiz_results')
          .update({
            user_id: userId,
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id);
          
        updateSuccess = !error;
        
        if (updateSuccess) {
          console.log('Fallback update successful with user ID');
          return true;
        }
      }
      
      // 2. Try with Session ID if available
      if (sessionId) {
        const { error } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            stripe_session_id: sessionId,
            access_method: 'purchase'
          })
          .eq('id', id);
          
        updateSuccess = !error;
        
        if (updateSuccess) {
          console.log('Fallback update successful with session ID');
          return true;
        }
      }
      
      // 3. Try with Guest Email if available
      if (guestEmail) {
        const { error } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            guest_email: guestEmail,
            access_method: 'purchase'
          })
          .eq('id', id);
          
        updateSuccess = !error;
        
        if (updateSuccess) {
          console.log('Fallback update successful with guest email');
          return true;
        }
      }
      
      // 4. Last resort - just try with ID only
      const { error } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', id);
        
      updateSuccess = !error;
      
      if (updateSuccess) {
        console.log('Fallback update successful with ID only');
        return true;
      }
      
      console.log('All fallback updates failed');
      return false;
    } catch (error) {
      console.error('Exception during fallback updates:', error);
      return false;
    }
  };
  
  return {
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates
  };
};
