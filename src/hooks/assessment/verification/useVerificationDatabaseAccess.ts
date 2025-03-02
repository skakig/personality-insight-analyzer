
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";

export const useVerificationDatabaseAccess = () => {
  // Fetch a result by user ID and result ID
  const fetchUserResult = async (resultId: string, userId?: string) => {
    if (!resultId) {
      return { data: null, error: new Error('No result ID provided') };
    }
    
    try {
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.maybeSingle();
      return { data, error };
    } catch (error: any) {
      console.error('Error fetching user result:', error);
      return { data: null, error };
    }
  };
  
  // Fetch a result by session ID
  const fetchResultBySessionId = async (resultId: string, sessionId: string) => {
    if (!resultId || !sessionId) {
      return { data: null, error: new Error('Missing required parameters') };
    }
    
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
      
      return { data, error };
    } catch (error: any) {
      console.error('Error fetching result by session ID:', error);
      return { data: null, error };
    }
  };
  
  // Check if a result exists by guest email
  const fetchResultByGuestEmail = async (resultId: string, guestEmail: string) => {
    if (!resultId || !guestEmail) {
      return { data: null, error: new Error('Missing required parameters') };
    }
    
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', guestEmail)
        .maybeSingle();
      
      return { data, error };
    } catch (error: any) {
      console.error('Error fetching result by guest email:', error);
      return { data: null, error };
    }
  };
  
  // Direct updates to purchase status
  const markResultAsPurchased = async (
    resultId: string, 
    options?: { 
      userId?: string,
      sessionId?: string,
      guestToken?: string,
      guestEmail?: string
    }
  ) => {
    if (!resultId) {
      return false;
    }
    
    try {
      const updateData: any = {
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      };
      
      if (options?.userId) {
        updateData.user_id = options.userId;
      }
      
      if (options?.sessionId) {
        updateData.stripe_session_id = options.sessionId;
      }
      
      if (options?.guestEmail) {
        updateData.guest_email = options.guestEmail;
      }
      
      const { error } = await supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);
      
      return !error;
    } catch (error) {
      console.error('Error updating purchase status:', error);
      return false;
    }
  };
  
  // Link a result to a user ID
  const linkResultToUser = async (resultId: string, userId: string) => {
    if (!resultId || !userId) {
      return false;
    }
    
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
    fetchUserResult,
    fetchResultBySessionId, 
    fetchResultByGuestEmail,
    markResultAsPurchased,
    linkResultToUser
  };
};
