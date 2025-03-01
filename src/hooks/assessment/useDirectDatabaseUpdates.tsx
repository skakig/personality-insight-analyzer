
import React from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides functions to directly update the database in scenarios where
 * the normal verification process fails
 */
export const useDirectDatabaseUpdates = () => {
  /**
   * Updates a result record for a specific user
   */
  const updateResultForUser = async (resultId: string, userId: string) => {
    try {
      console.log('Updating result for user:', userId);
      
      const { data: result, error: fetchError } = await supabase
        .from('quiz_results')
        .select('is_purchased, purchase_status')
        .eq('id', resultId)
        .maybeSingle();
      
      // If already purchased, no update needed
      if (result?.is_purchased === true || result?.purchase_status === 'completed') {
        console.log('Result already purchased, no update needed');
        return true;
      }
      
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
        console.error('Error updating for user:', error);
        // Try a slightly different approach with match on user_id
        const { error: secondError } = await supabase
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
        
        if (secondError) {
          console.error('Second attempt also failed:', secondError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Update for user failed:', error);
      return false;
    }
  };

  /**
   * Updates a result with Stripe session ID
   */
  const updateResultWithSessionId = async (resultId: string, sessionId: string) => {
    try {
      console.log('Updating result with session ID:', sessionId);
      
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
        // Try a different approach with just the result ID
        console.error('Session update failed, trying with just result ID:', error);
        const { error: secondError } = await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: sessionId,
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', resultId);
        
        if (secondError) {
          console.error('Second attempt also failed:', secondError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Session update failed:', error);
      return false;
    }
  };

  /**
   * Tries various fallback update methods when standard verification fails
   */
  const tryFallbackUpdates = async (options: {
    id: string;
    userId?: string;
    sessionId?: string | null;
    guestEmail?: string | null;
  }) => {
    const { id, userId, sessionId, guestEmail } = options;
    
    try {
      console.log('Attempting fallback updates with available data');
      
      // If we have a user ID, try updating by that first
      if (userId) {
        console.log('Fallback: Updating by user ID');
        const userUpdated = await updateResultForUser(id, userId);
        if (userUpdated) return true;
      }
      
      // If we have a session ID, try that
      if (sessionId) {
        console.log('Fallback: Updating by session ID');
        const sessionUpdated = await updateResultWithSessionId(id, sessionId);
        if (sessionUpdated) return true;
      }
      
      // If we have guest email, try that
      if (guestEmail) {
        console.log('Fallback: Updating by guest email');
        const { error: emailError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id)
          .eq('guest_email', guestEmail);
        
        if (!emailError) return true;
      }
      
      // Last resort: Just update the result directly
      console.log('Fallback: Direct update as last resort');
      const { error: lastError } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', id);
      
      return !lastError;
    } catch (error) {
      console.error('All fallback attempts failed:', error);
      return false;
    }
  };

  return {
    updateResultForUser,
    updateResultWithSessionId,
    tryFallbackUpdates
  };
};
