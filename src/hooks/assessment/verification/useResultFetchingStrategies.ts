
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides strategies for fetching updated results during verification
 */
export const useResultFetchingStrategies = () => {
  /**
   * Fetch result by user ID
   */
  const fetchByUserId = async (id: string, userId: string) => {
    try {
      console.log('Fetching result by user ID', { id, userId });
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      
      return data;
    } catch (error) {
      console.error('User fetch error:', error);
      return null;
    }
  };
  
  /**
   * Fetch result by session ID
   */
  const fetchBySessionId = async (id: string, sessionId: string) => {
    try {
      console.log('Fetching result by session ID', { id, sessionId });
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
      
      return data;
    } catch (error) {
      console.error('Session fetch error:', error);
      return null;
    }
  };
  
  /**
   * Fetch result by ID only
   */
  const fetchById = async (id: string) => {
    try {
      console.log('Fetching result by ID only', { id });
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      return data;
    } catch (error) {
      console.error('Direct fetch error:', error);
      return null;
    }
  };
  
  return {
    fetchByUserId,
    fetchBySessionId,
    fetchById
  };
};
