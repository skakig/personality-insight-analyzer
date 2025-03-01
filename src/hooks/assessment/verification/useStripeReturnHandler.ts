
import { supabase } from "@/integrations/supabase/client";

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
    
    if (success && sessionId) {
      console.log('Detected return from Stripe checkout:', {
        resultId,
        sessionId,
        userId: options?.userId || 'guest'
      });
      
      try {
        // For logged-in users, directly update the purchase status
        if (options?.userId) {
          console.log('Attempting direct database update for logged-in user with session ID:', sessionId);
          
          // First try updating with both result ID and user ID which is most reliable
          const { error: userError } = await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              stripe_session_id: sessionId
            })
            .eq('id', resultId)
            .eq('user_id', options.userId);
            
          if (!userError) {
            console.log('Successfully updated quiz result for user:', options.userId);
            
            // Also update purchase_tracking record if it exists
            try {
              await supabase
                .from('purchase_tracking')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  stripe_session_id: sessionId
                })
                .eq('quiz_result_id', resultId)
                .eq('user_id', options.userId);
              
              console.log('Updated related purchase tracking record');
            } catch (trackingError) {
              console.log('Non-critical error updating tracking record:', trackingError);
            }
            
            // Fetch the updated result
            const { data: result } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', resultId)
              .eq('user_id', options.userId)
              .maybeSingle();
              
            if (result) {
              console.log('Successfully fetched updated result after purchase');
              // Clear URL parameters to prevent repeat processing
              window.history.replaceState({}, document.title, window.location.pathname);
              return result;
            }
          } else {
            console.error('Failed to update purchase status:', userError);
            
            // Fallback: try updating with session ID if user ID update failed
            if (sessionId) {
              const { error: sessionError } = await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase',
                  stripe_session_id: sessionId
                })
                .eq('id', resultId)
                .eq('stripe_session_id', sessionId);
                
              if (!sessionError) {
                console.log('Successfully updated with session ID:', sessionId);
                const { data: sessionResult } = await supabase
                  .from('quiz_results')
                  .select('*')
                  .eq('id', resultId)
                  .eq('stripe_session_id', sessionId)
                  .maybeSingle();
                  
                if (sessionResult) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  return sessionResult;
                }
              } else {
                console.error('Session ID update also failed:', sessionError);
              }
            }
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
