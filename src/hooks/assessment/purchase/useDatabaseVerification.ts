
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";

/**
 * Hook for verification-related database operations
 */
export const useDatabaseVerification = () => {
  const markResultAsPurchased = useCallback(async (
    resultId: string, 
    options?: { 
      userId?: string, 
      sessionId?: string, 
      guestToken?: string,
      guestEmail?: string 
    }
  ) => {
    if (!resultId) {
      console.error('No result ID provided for purchase update');
      return false;
    }
    
    try {
      console.log('Updating result as purchased:', { resultId, ...options });
      
      const updateData = {
        is_purchased: true,
        is_detailed: true, 
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      };
      
      // Build the query based on available options
      let query = supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);
      
      // Add filters if available
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      } else if (options?.sessionId) {
        query = query.eq('stripe_session_id', options.sessionId);
      } else if (options?.guestToken) {
        query = query.eq('guest_access_token', options.guestToken);
      } else if (options?.guestEmail) {
        query = query.eq('guest_email', options.guestEmail);
      }
      
      const { error } = await query;
      
      if (error) {
        console.error('Error updating result as purchased:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markResultAsPurchased:', error);
      return false;
    }
  }, []);
  
  const attemptDirectUpdate = useCallback(async (resultId: string) => {
    if (!resultId) return false;
    
    try {
      console.log('Attempting direct update for result:', resultId);
      
      const { error } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'direct_update'
        })
        .eq('id', resultId);
        
      if (error) {
        console.error('Direct update failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in attemptDirectUpdate:', error);
      return false;
    }
  }, []);
  
  const linkResultToUser = useCallback(async (resultId: string, userId: string) => {
    if (!resultId || !userId) return false;
    
    try {
      const { error } = await supabase
        .from('quiz_results')
        .update({ user_id: userId })
        .eq('id', resultId);
        
      if (error) {
        console.error('Error linking result to user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in linkResultToUser:', error);
      return false;
    }
  }, []);
  
  const fetchUserResult = useCallback(async (resultId: string, userId?: string) => {
    try {
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId);
        
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error fetching user result:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchUserResult:', error);
      return null;
    }
  }, []);
  
  const fetchResultBySessionId = useCallback(async (resultId: string, sessionId: string) => {
    try {
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
      console.error('Error in fetchResultBySessionId:', error);
      return null;
    }
  }, []);
  
  const checkPurchaseStatus = useCallback(async (resultId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking purchase status:', error);
        return false;
      }
      
      return data ? isPurchased(data) : false;
    } catch (error) {
      console.error('Error in checkPurchaseStatus:', error);
      return false;
    }
  }, []);
  
  return {
    markResultAsPurchased,
    attemptDirectUpdate,
    linkResultToUser,
    fetchUserResult,
    fetchResultBySessionId,
    checkPurchaseStatus
  };
};
