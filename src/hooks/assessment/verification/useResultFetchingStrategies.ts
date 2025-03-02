
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides strategies for fetching updated results during verification
 */
export const useResultFetchingStrategies = () => {
  
  /**
   * Fetches a result by user ID
   */
  const fetchUserResult = async (resultId: string, userId: string) => {
    try {
      console.log('Fetching result for user:', { resultId, userId });
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user result:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception during user result fetch:', error);
      return null;
    }
  };
  
  /**
   * Fetches a result by session ID
   */
  const fetchResultBySessionId = async (resultId: string, sessionId: string) => {
    try {
      console.log('Fetching result by session ID:', { resultId, sessionId });
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching result by session ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception during session result fetch:', error);
      return null;
    }
  };
  
  /**
   * Fetches a result by ID only
   */
  const fetchResultById = async (resultId: string) => {
    try {
      console.log('Fetching result by ID:', resultId);
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching result by ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception during result fetch by ID:', error);
      return null;
    }
  };
  
  return {
    fetchUserResult,
    fetchResultBySessionId,
    fetchResultById
  };
};
