
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides direct database update methods for verification
 */
export const useDirectDatabaseUpdates = () => {
  /**
   * Updates a result directly based on user ID
   */
  const updateResultForUser = async (id: string, userId: string) => {
    try {
      console.log('Attempting direct database update by user ID:', { resultId: id, userId });
      
      const { error } = await supabase
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
        
      if (error) {
        console.error('Direct user update failed:', error);
        return false;
      }
      
      console.log('Direct user update successful');
      return true;
    } catch (error) {
      console.error('Error in direct user update:', error);
      return false;
    }
  };
  
  /**
   * Updates a result directly based on session ID
   */
  const updateResultWithSessionId = async (id: string, sessionId: string) => {
    try {
      console.log('Attempting direct database update by session ID:', { resultId: id, sessionId });
      
      const { error } = await supabase
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
        
      if (error) {
        console.error('Direct session update failed:', error);
        
        // Try again without the session ID filter as fallback
        const { error: fallbackError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            stripe_session_id: sessionId
          })
          .eq('id', id);
          
        if (fallbackError) {
          console.error('Fallback direct update also failed:', fallbackError);
          return false;
        }
      }
      
      console.log('Direct session update successful');
      return true;
    } catch (error) {
      console.error('Error in direct session update:', error);
      return false;
    }
  };
  
  /**
   * Tries various fallback update methods
   */
  const tryFallbackUpdates = async (options: {
    id: string;
    userId?: string;
    sessionId?: string | null;
    guestEmail?: string | null;
  }) => {
    const { id, userId, sessionId, guestEmail } = options;
    
    try {
      console.log('Trying fallback updates with:', {
        resultId: id,
        userId: userId || 'none',
        sessionId: sessionId || 'none',
        guestEmail: guestEmail || 'none'
      });
      
      // Try with all available information
      let updateQuery = supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', id);
        
      // Add user filter if available
      if (userId) {
        updateQuery = updateQuery.eq('user_id', userId);
      }
      
      // Add session filter if available
      if (sessionId) {
        // Update the stripe_session_id column
        await supabase
          .from('quiz_results')
          .update({ stripe_session_id: sessionId })
          .eq('id', id);
      }
      
      // Add guest email filter if available
      if (guestEmail) {
        updateQuery = updateQuery.eq('guest_email', guestEmail);
      }
      
      const { error } = await updateQuery;
      
      if (error) {
        console.error('Fallback update failed:', error);
        
        // Try with just the ID as a last resort
        const { error: idOnlyError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id);
          
        if (idOnlyError) {
          console.error('ID-only fallback update failed:', idOnlyError);
          return false;
        }
      }
      
      console.log('Fallback update successful');
      return true;
    } catch (error) {
      console.error('Error in fallback updates:', error);
      return false;
    }
  };
  
  return {
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates
  };
};
