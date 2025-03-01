
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches updated results after database modifications
 */
export const useFetchUpdatedResult = () => {
  const fetchUserResult = async (id: string, userId: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching user result:', error);
      return null;
    }
  };

  const fetchResultBySessionId = async (id: string, sessionId: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching result by session ID:', error);
      return null;
    }
  };

  const fetchResultById = async (id: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching result by ID:', error);
      return null;
    }
  };

  return {
    fetchUserResult,
    fetchResultBySessionId,
    fetchResultById
  };
};
