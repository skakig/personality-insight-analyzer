
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { useDatabaseUpdateStrategies } from "./useDatabaseUpdateStrategies";

export const useStandardVerification = () => {
  // Use database strategies for updates
  const databaseStrategies = useDatabaseUpdateStrategies();
  
  // Function to perform standard verification with all available parameters
  const performStandardVerification = async (
    resultId: string,
    userId?: string,
    trackingId?: string,
    sessionId?: string,
    guestToken?: string, 
    guestEmail?: string
  ) => {
    try {
      console.log('Running standard verification with params:', { 
        resultId, userId, trackingId, sessionId, guestToken, guestEmail 
      });
      
      // First check if result already purchased
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result && isPurchased(result)) {
        console.log('Result already purchased');
        return result;
      }
      
      // Try with user ID if available
      if (userId) {
        const success = await databaseStrategies.updateForCheckoutSuccess(resultId, userId);
        if (success) {
          console.log('User ID verification successful');
          return await fetchVerifiedResult(resultId);
        }
      }
      
      // Try with session ID if available
      if (sessionId) {
        const success = await databaseStrategies.updateForCheckoutSuccess(resultId, undefined, sessionId);
        if (success) {
          console.log('Session ID verification successful');
          return await fetchVerifiedResult(resultId);
        }
      }
      
      // If we have a guest token, try to update with that
      if (guestToken) {
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
          .eq('guest_access_token', guestToken);
          
        if (!error) {
          console.log('Guest token verification successful');
          return await fetchVerifiedResult(resultId);
        }
      }
      
      // If we have a guest email, try to update with that
      if (guestEmail) {
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
          .eq('guest_email', guestEmail);
          
        if (!error) {
          console.log('Guest email verification successful');
          return await fetchVerifiedResult(resultId);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Standard verification error:', error);
      return null;
    }
  };
  
  // Helper to fetch the result after verification
  const fetchVerifiedResult = async (resultId: string) => {
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    return result;
  };
  
  // Last resort verification (force update)
  const performLastResortVerification = async (resultId: string) => {
    try {
      console.log('Performing last resort verification for result:', resultId);
      
      const { error } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'forced_update'
        })
        .eq('id', resultId);
        
      if (error) {
        console.error('Last resort verification error:', error);
        return null;
      }
      
      return await fetchVerifiedResult(resultId);
    } catch (error) {
      console.error('Last resort verification error:', error);
      return null;
    }
  };
  
  return {
    performStandardVerification,
    performLastResortVerification
  };
};
