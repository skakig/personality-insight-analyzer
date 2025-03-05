
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cleanupPurchaseState, storePurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Handles basic verification strategies for newly returning users from Stripe
 */
export const useBasicVerificationStrategies = (
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  stopVerification: () => void
) => {
  /**
   * Attempt to verify purchase for a logged-in user
   */
  const verifyForLoggedInUser = async (id: string, userId: string, sessionId?: string | null) => {
    console.log('Basic strategy: Verifying for logged-in user', { id, userId });
    
    // Try direct database update by user ID
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Direct user update failed:', updateError);
      return false;
    }
    
    // Fetch the updated result
    const { data: userResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (userResult) {
      console.log('Successfully verified purchase for logged-in user');
      setResult(userResult);
      setLoading(false);
      stopVerification();
      toast({
        title: "Purchase verified!",
        description: "Your detailed report is now available.",
      });
      
      if (sessionId) {
        storePurchaseData(id, sessionId, userId);
        cleanupPurchaseState();
      }
      
      return true;
    }
    
    return false;
  };
  
  /**
   * Attempt to verify purchase with session ID
   */
  const verifyWithSessionId = async (id: string, sessionId: string, userId?: string) => {
    console.log('Basic strategy: Verifying with session ID', { id, sessionId });
    
    // Update result with session ID
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: sessionId
      })
      .eq('id', id)
      .eq('stripe_session_id', sessionId);
    
    if (updateError) {
      console.error('Session ID update failed:', updateError);
      return false;
    }
    
    // Fetch the updated result
    const { data: sessionResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    
    if (sessionResult) {
      console.log('Successfully verified purchase with session ID');
      setResult(sessionResult);
      setLoading(false);
      stopVerification();
      toast({
        title: "Purchase verified!",
        description: "Your detailed report is now available.",
      });
      
      storePurchaseData(id, sessionId, userId);
      return true;
    }
    
    return false;
  };
  
  return {
    verifyForLoggedInUser,
    verifyWithSessionId
  };
};
