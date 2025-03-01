
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles direct database updates for purchase verification
 */
export const useDirectDatabaseUpdates = () => {
  const updateResultForUser = async (id: string, userId: string) => {
    try {
      console.log('Attempting direct update for logged-in user:', userId);
      
      // First check if the result belongs to this user
      const { data: userResult, error: checkError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Failed to check if result belongs to user:', checkError);
      }
      
      // If the result doesn't belong to this user, try to update the user_id first
      if (!userResult) {
        console.log('Result not found for user, trying to update ownership');
        await supabase
          .from('quiz_results')
          .update({ user_id: userId })
          .eq('id', id);
      }
      
      const { error } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          user_id: userId // Ensure the result is associated with this user
        })
        .eq('id', id);
      
      if (error) {
        console.error('Direct update for logged-in user failed:', error);
        
        // Try one more time without user_id filter (in case the result exists but doesn't have user_id set)
        const { error: fallbackError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            user_id: userId // Ensure the result is associated with this user
          })
          .eq('id', id);
          
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
          return false;
        }
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
          access_method: 'purchase',
          stripe_session_id: sessionId // Store session ID in result
        })
        .eq('id', id)
        .eq('stripe_session_id', sessionId);
      
      if (error) {
        console.error('Session ID update failed:', error);
        
        // Try again without the session ID filter (in case it wasn't set yet)
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
          console.error('Fallback session ID update failed:', fallbackError);
          return false;
        }
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
            access_method: 'purchase',
            user_id: userId // Ensure user ownership
          })
          .eq('id', id)
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
            access_method: 'purchase',
            stripe_session_id: sessionId
          })
          .eq('id', id)
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
            access_method: 'purchase',
            guest_email: guestEmail
          })
          .eq('id', id)
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
