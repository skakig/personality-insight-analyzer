
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides strategies for fetching results during verification process
 */
export const useResultFetchingStrategies = () => {
  /**
   * Fetch result using various filtering strategies
   */
  const fetchResult = async (
    id: string, 
    userId?: string, 
    sessionId?: string | null
  ) => {
    try {
      // Try most specific filters first (best accuracy)
      if (userId && sessionId) {
        const { data } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .eq('stripe_session_id', sessionId)
          .maybeSingle();
          
        if (data) return data;
      }
      
      // Try with user ID
      if (userId) {
        const { data } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (data) return data;
      }
      
      // Try with session ID
      if (sessionId) {
        const { data } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .eq('stripe_session_id', sessionId)
          .maybeSingle();
          
        if (data) return data;
      }
      
      // Last resort: just ID
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Result fetch error:', error);
      return null;
    }
  };
  
  /**
   * Fetch result by user ID
   */
  const fetchByUserId = async (id: string, userId: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching by user ID:', error);
      return null;
    }
  };
  
  /**
   * Fetch result by session ID
   */
  const fetchBySessionId = async (id: string, sessionId: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching by session ID:', error);
      return null;
    }
  };
  
  /**
   * Fetch result by ID only
   */
  const fetchById = async (id: string) => {
    try {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      return data;
    } catch (error) {
      console.error('Error fetching by ID:', error);
      return null;
    }
  };
  
  return {
    fetchResult,
    fetchByUserId,
    fetchBySessionId,
    fetchById
  };
};
