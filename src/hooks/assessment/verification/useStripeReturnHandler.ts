
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
    
    if (success || sessionId || storedData.sessionId) {
      console.log('Detected return from Stripe checkout:', {
        resultId,
        sessionId: sessionId || storedData.sessionId,
        userId: storedUserId || 'guest',
        success,
        hasUrlSessionId: !!urlParams.get('session_id'),
        hasStoredSessionId: !!storedData.sessionId,
        timestamp: new Date().toISOString()
      });
      
      try {
        // Get current auth session to verify user
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || storedUserId;
        
        // For logged-in users, directly update the purchase status
        if (userId) {
          console.log('Attempting direct database update for logged-in user with session ID:', 
            sessionId || storedData.sessionId);
          
          // First try updating with both result ID and user ID which is most reliable
          const { error: userError } = await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              stripe_session_id: sessionId || storedData.sessionId,
              user_id: userId // Ensure user ID is set
            })
            .eq('id', resultId);
            
          if (!userError) {
            console.log('Successfully updated quiz result for user:', userId);
            
            // Also update purchase_tracking record if it exists
            try {
              await supabase
                .from('purchase_tracking')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  stripe_session_id: sessionId || storedData.sessionId,
                  user_id: userId // Ensure user ID is set
                })
                .eq('quiz_result_id', resultId);
              
              console.log('Updated related purchase tracking record');
            } catch (trackingError) {
              console.log('Non-critical error updating tracking record:', trackingError);
            }
            
            // Fetch the updated result
            const { data: result } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', resultId)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (result) {
              console.log('Successfully fetched updated result after purchase');
              toast({
                title: "Purchase Verified",
                description: "Your detailed report is now available!",
              });
              
              // Clear URL parameters to prevent repeat processing
              window.history.replaceState({}, document.title, window.location.pathname);
              cleanupPurchaseState();
              return result;
            }
          } else {
            console.error('Failed to update purchase status with user ID:', userError);
            
            // Fallback: try updating with session ID if user ID update failed
            if (sessionId || storedData.sessionId) {
              const { error: sessionError } = await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase',
                  stripe_session_id: sessionId || storedData.sessionId,
                  user_id: userId // Ensure user ID is set
                })
                .eq('id', resultId)
                .eq('stripe_session_id', sessionId || storedData.sessionId);
                
              if (!sessionError) {
                console.log('Successfully updated with session ID:', sessionId || storedData.sessionId);
                const { data: sessionResult } = await supabase
                  .from('quiz_results')
                  .select('*')
                  .eq('id', resultId)
                  .eq('stripe_session_id', sessionId || storedData.sessionId)
                  .maybeSingle();
                  
                if (sessionResult) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  cleanupPurchaseState();
                  return sessionResult;
                }
              } else {
                console.error('Session ID update also failed:', sessionError);
              }
            }
          }
        }
        
        // Last resort: try direct update with just the ID
        const { error: directError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', resultId);
          
        if (!directError) {
          console.log('Direct ID update as last resort succeeded');
          const { data: directResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (directResult) {
            cleanupPurchaseState();
            return directResult;
          }
        }
      } catch (error) {
        console.error('Error handling Stripe return:', error);
      }
    }
    
    return null;
  };

  return {
    handleStripeReturn
  };
};
