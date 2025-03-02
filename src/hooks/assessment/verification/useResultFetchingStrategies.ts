
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides strategies for fetching quiz results
 */
export const useResultFetchingStrategies = () => {
  /**
   * Fetch a quiz result by user ID
   */
  const fetchUserResult = async (resultId: string, userId?: string) => {
    try {
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId);
        
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      return await query.maybeSingle();
    } catch (error) {
      console.error('Error fetching user result:', error);
      return { data: null, error };
    }
  };
  
  /**
   * Fetch a quiz result by session ID
   */
  const fetchResultBySessionId = async (resultId: string, sessionId: string) => {
    try {
      return await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
    } catch (error) {
      console.error('Error fetching result by session ID:', error);
      return { data: null, error };
    }
  };
  
  /**
   * Fetch a quiz result by guest token
   */
  const fetchResultByGuestToken = async (resultId: string, token: string) => {
    try {
      return await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_access_token', token)
        .maybeSingle();
    } catch (error) {
      console.error('Error fetching result by guest token:', error);
      return { data: null, error };
    }
  };
  
  /**
   * Fetch a quiz result by guest email
   */
  const fetchResultByGuestEmail = async (resultId: string, email: string) => {
    try {
      return await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', email)
        .maybeSingle();
    } catch (error) {
      console.error('Error fetching result by guest email:', error);
      return { data: null, error };
    }
  };
  
  return {
    fetchUserResult,
    fetchResultBySessionId,
    fetchResultByGuestToken,
    fetchResultByGuestEmail
  };
};
