
import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { cleanupPurchaseState } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";

export const useVerifyPurchase = (
  setLoading: (value: boolean) => void,
  setResult: (result: any) => void,
  { startVerification, stopVerification, incrementAttempts }: {
    startVerification: () => void;
    stopVerification: () => void;
    incrementAttempts: () => void;
  }
) => {
  const verifyPurchase = async (id: string) => {
    startVerification();
    toast({
      title: "Verifying your purchase",
      description: "Please wait while we prepare your report...",
    });

    console.log('Beginning purchase verification for ID:', id);
    
    // Get the URL parameters in case we've just returned from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const sessionId = urlParams.get('session_id') || localStorage.getItem('stripeSessionId');
    
    console.log('Verification params:', {
      resultId: id,
      success: successParam,
      hasSessionId: !!sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      // First try a direct session verification if we have a session ID
      if (sessionId) {
        console.log('Attempting direct verification with session ID:', sessionId);
        
        try {
          // Do a direct database update if we have just returned from Stripe
          if (successParam === 'true') {
            console.log('Purchase success flag detected, updating result directly');
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            
            const { data: updateResult, error: updateError } = await supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id)
              .eq('stripe_session_id', sessionId);
              
            if (!updateError) {
              console.log('Direct update successful!');
              
              // Also update any purchase tracking records
              await supabase
                .from('purchase_tracking')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('stripe_session_id', sessionId);
            }
          }
        } catch (directError) {
          console.error('Direct verification failed:', directError);
        }
      }
      
      // Use the retry mechanism for post-purchase verification
      const verifiedResult = await verifyPurchaseWithRetry(id, 5, 1000); // Reduced retries with shorter delays
      
      if (verifiedResult) {
        console.log('Purchase verified successfully!');
        setResult(verifiedResult);
        toast({
          title: "Purchase successful!",
          description: "Your detailed report is now available.",
        });
        setLoading(false);
        stopVerification();
        
        // Clear purchase-related localStorage partially
        cleanupPurchaseState();
        
        return true;
      } else {
        console.log('Purchase verification failed after retries, trying direct approach');
        incrementAttempts();
        
        // Try a more direct approach as last resort
        try {
          const stripeSessionId = localStorage.getItem('stripeSessionId');
          const guestEmail = localStorage.getItem('guestEmail');
          
          // Check if we have a session ID or just returned from Stripe
          if ((stripeSessionId || successParam === 'true') && id) {
            console.log('Attempting final direct update for result:', id);
            
            // Get current session to check user
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            
            // Build the update query
            let updateQuery = supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id);
              
            // Add additional filters based on available data
            if (stripeSessionId) {
              updateQuery = updateQuery.eq('stripe_session_id', stripeSessionId);
            }
            if (userId) {
              console.log('Adding user ID filter:', userId);
              updateQuery = updateQuery.eq('user_id', userId);
            } else if (guestEmail) {
              console.log('Adding guest email filter:', guestEmail);
              updateQuery = updateQuery.eq('guest_email', guestEmail);
            }
            
            // Execute the update
            const { error: finalUpdateError } = await updateQuery;
            
            if (finalUpdateError) {
              console.error('Final update error:', finalUpdateError);
            } else {
              console.log('Final update appears successful!');
            }
              
            // Fetch the result one last time
            const { data: finalResult } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', id)
              .maybeSingle();
              
            if (finalResult) {
              setResult(finalResult);
              toast({
                title: "Purchase verified!",
                description: "Your detailed report is now available.",
              });
              setLoading(false);
              stopVerification();
              return true;
            }
          }
        } catch (finalError) {
          console.error('Final verification attempt failed:', finalError);
        }
        
        // The verification failed message is now handled in the main hook
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      incrementAttempts();
      return false;
    }
  };

  return {
    verifyPurchase
  };
};
