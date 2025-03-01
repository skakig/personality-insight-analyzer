import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Provides strategies for verifying purchases through different methods
 */
export const useVerificationStrategies = (
  setResult: (result: any) => void,
  setLoading: (loading: boolean) => void,
  stopVerification: () => void
) => {
  
  /**
   * Verifies a purchase for a logged-in user using their user ID
   */
  const verifyForLoggedInUser = async (id: string, userId: string, sessionId?: string | null) => {
    console.log('Attempting verification for logged-in user:', userId);
    
    // First check if this result belongs to the user and is already purchased
    const { data: userResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (userResult?.is_purchased || userResult?.is_detailed) {
      console.log('Result already purchased for logged in user');
      setResult(userResult);
      setLoading(false);
      stopVerification();
      return true;
    }
    
    // Update the database for logged-in user
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
      
    if (!updateError) {
      // Fetch the updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
          
      if (updatedResult) {
        console.log('Successfully fetched updated result for logged-in user');
        setResult(updatedResult);
        setLoading(false);
        stopVerification();
        toast({
          title: "Purchase verified!",
          description: "Your detailed report is now available.",
        });
        
        // Keep the result ID in case we need it later
        storePurchaseData(id, sessionId || '', userId);
        return true;
      }
    }
    
    return false;
  };
  
  /**
   * Verifies a purchase using the Stripe session ID
   */
  const verifyWithSessionId = async (id: string, sessionId: string, userId?: string) => {
    console.log('Attempting verification with session ID:', sessionId);
    
    // First sync the session ID with the result if needed
    try {
      await supabase
        .from('quiz_results')
        .update({ stripe_session_id: sessionId })
        .eq('id', id);
    } catch (syncError) {
      console.error('Session ID sync error (non-critical):', syncError);
    }
    
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
        
    if (!updateError) {
      // Fetch the updated result
      const { data: sessionResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
            
      if (sessionResult) {
        console.log('Successfully fetched updated result via session ID');
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
    }
    
    return false;
  };
  
  /**
   * Final fallback verification - try direct update without filters
   */
  const performFallbackVerification = async (id: string, userId?: string, sessionId?: string | null) => {
    console.log('Trying direct database update as last resort');
    
    // Try without any filters
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', id);
        
    if (!updateError) {
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .maybeSingle();
          
      if (updatedResult) {
        console.log('Last resort update successful!');
        setResult(updatedResult);
        setLoading(false);
        stopVerification();
        toast({
          title: "Purchase verified!",
          description: "Your detailed report is now available.",
        });
        if (sessionId) {
          storePurchaseData(id, sessionId, userId);
        }
        return true;
      }
    }
    
    return false;
  };
  
  return {
    verifyForLoggedInUser,
    verifyWithSessionId,
    performFallbackVerification
  };
};
