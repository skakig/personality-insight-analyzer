
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cleanupPurchaseState, getPurchaseState } from "@/utils/purchaseStateUtils";

/**
 * Specialized hook for handling returns from Stripe checkout
 */
export const useStripeReturnHandler = () => {
  /**
   * Check if the user is returning from a successful Stripe checkout
   * and try to immediately validate the purchase
   */
  const handleStripeReturn = async (resultId: string, options?: { userId?: string, sessionId?: string }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id') || options?.sessionId;
    
    // Get stored data from localStorage
    const storedData = getPurchaseState();
    const storedUserId = storedData.userId || options?.userId;
    
    if (!success || !sessionId) {
      console.log('Not a successful return from Stripe or missing session ID');
      return null;
    }
    
    console.log('Processing return from Stripe checkout:', { 
      resultId,
      sessionId,
      success,
      userId: storedUserId || 'guest'
    });
    
    try {
      // Attempt to update the purchase status directly
      const updateData = {
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: sessionId
      };
      
      let query = supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);
      
      // Add user_id filter if available (for logged-in users)
      if (storedUserId) {
        query = query.eq('user_id', storedUserId);
      }
      
      const { error: updateError } = await query;
      
      if (updateError) {
        console.error('Error updating purchase status:', updateError);
        
        // Try one more time without user filter if it failed
        const { error: fallbackError } = await supabase
          .from('quiz_results')
          .update(updateData)
          .eq('id', resultId)
          .eq('stripe_session_id', sessionId);
          
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
          return null;
        }
      }
      
      // Update purchase tracking if it exists
      try {
        await supabase
          .from('purchase_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('stripe_session_id', sessionId);
      } catch (trackingError) {
        console.error('Failed to update tracking record:', trackingError);
        // Non-critical error, continue
      }
      
      // Fetch the updated result
      const { data: result, error: fetchError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching updated result:', fetchError);
        return null;
      }
      
      if (result) {
        console.log('Successfully verified purchase from Stripe return');
        toast({
          title: "Purchase Completed",
          description: "Your full report is now available.",
        });
        
        // Clean up stored purchase data
        cleanupPurchaseState();
        
        return result;
      }
    } catch (error) {
      console.error('Error processing Stripe return:', error);
    }
    
    return null;
  };

  return {
    handleStripeReturn
  };
};
