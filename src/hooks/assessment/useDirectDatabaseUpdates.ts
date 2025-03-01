
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles direct database updates for purchase verification
 */
export const useDirectDatabaseUpdates = () => {
  const updateResultForUser = async (id: string, userId: string) => {
    try {
      console.log('Attempting direct update for logged-in user:', userId);
      
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
        console.error('Direct update for logged-in user failed:', error);
        return false;
      }
      
      console.log('Direct DB update successful for logged-in user');
      return true;
    } catch (error) {
      console.error('Error in user update:', error);
      return false;
    }
  };

  const updateResultWithSessionId = async (id: string, sessionId: string) => {
    try {
      console.log('Attempting update with session ID:', sessionId);
      
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
        .eq('stripe_session_id', sessionId);
      
      if (error) {
        console.error('Session ID update failed:', error);
        return false;
      }
      
      // Also update purchase tracking
      await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId);
        
      console.log('Session ID update successful');
      return true;
    } catch (error) {
      console.error('Error in session update:', error);
      return false;
    }
  };

  const tryFallbackUpdates = async (options: {
    id: string;
    userId?: string;
    sessionId?: string;
    guestEmail?: string | null;
  }) => {
    const { id, userId, sessionId, guestEmail } = options;
    const updateAttempts = [];
    
    // 1. User ID based update for logged-in users
    if (userId) {
      updateAttempts.push({
        name: 'user-id-update',
        query: supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id)
          .eq('user_id', userId)
      });
    }
    
    // 2. Session ID based update
    if (sessionId) {
      updateAttempts.push({
        name: 'session-id-update',
        query: supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id)
          .eq('stripe_session_id', sessionId)
      });
    }
    
    // 3. Guest email based update
    if (guestEmail) {
      updateAttempts.push({
        name: 'guest-email-update',
        query: supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id)
          .eq('guest_email', guestEmail)
      });
    }
    
    // 4. Direct ID update as last resort
    updateAttempts.push({
      name: 'direct-id-update',
      query: supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', id)
    });
    
    // Try each update strategy
    for (const attempt of updateAttempts) {
      try {
        console.log(`Attempting ${attempt.name} verification strategy`);
        const { error } = await attempt.query;
        
        if (!error) {
          console.log(`Update successful with ${attempt.name} strategy!`);
          return true;
        }
      } catch (attemptError) {
        console.error(`Error with ${attempt.name} verification:`, attemptError);
      }
    }
    
    return false;
  };

  return {
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates
  };
};
