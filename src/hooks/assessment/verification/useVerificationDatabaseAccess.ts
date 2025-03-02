
import { supabase } from "@/integrations/supabase/client";
import { useResultFetchingStrategies } from "./useResultFetchingStrategies";

/**
 * Hook that provides database access functionality for verification
 */
export const useVerificationDatabaseAccess = () => {
  const resultFetchers = useResultFetchingStrategies();
  
  /**
   * Updates a result as purchased
   */
  const markResultAsPurchased = async (resultId: string, options?: {
    userId?: string;
    sessionId?: string;
    guestToken?: string;
    guestEmail?: string;
  }) => {
    try {
      const { userId, sessionId, guestToken, guestEmail } = options || {};
      console.log('Marking result as purchased:', { resultId, userId, sessionId });
      
      // Start with base query
      let query = supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
      
      // Add filters if available
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('stripe_session_id', sessionId);
      } else if (guestToken) {
        query = query.eq('guest_access_token', guestToken);
      } else if (guestEmail) {
        query = query.eq('guest_email', guestEmail);
      }
      
      const { error } = await query;
      
      if (error) {
        console.error('Error marking result as purchased:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception marking result as purchased:', error);
      return false;
    }
  };
  
  /**
   * Links a result to a user
   */
  const linkResultToUser = async (resultId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_results')
        .update({ user_id: userId })
        .eq('id', resultId);
        
      return !error;
    } catch (error) {
      console.error('Error linking result to user:', error);
      return false;
    }
  };
  
  return {
    ...resultFetchers,
    markResultAsPurchased,
    linkResultToUser
  };
};
