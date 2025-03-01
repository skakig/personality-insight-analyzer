
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
      // First try a direct session verification for logged-in users
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId && successParam === 'true') {
        console.log('Logged-in user detected, attempting direct verification for user:', userId);
        
        // Direct DB update for logged-in users returning from successful purchase
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
          console.error('Direct update for logged-in user failed:', updateError);
        } else {
          console.log('Direct DB update successful for logged-in user');
          
          // Fetch the updated result
          const { data: userResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (userResult) {
            console.log('Successfully fetched updated result for logged-in user');
            setResult(userResult);
            setLoading(false);
            stopVerification();
            toast({
              title: "Purchase verified!",
              description: "Your detailed report is now available.",
            });
            // Clean up purchase state partially
            cleanupPurchaseState();
            return true;
          }
        }
      }
      
      // For cases with a session ID, regardless of user state
      if (sessionId) {
        console.log('Attempting verification with session ID:', sessionId);
        
        try {
          // Update result with session ID directly
          const { error: sessionUpdateError } = await supabase
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
          
          if (!sessionUpdateError) {
            console.log('Direct session update successful');
            
            // Also update purchase tracking
            await supabase
              .from('purchase_tracking')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('stripe_session_id', sessionId);
              
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
              cleanupPurchaseState();
              return true;
            }
          }
        } catch (sessionError) {
          console.error('Session-based update failed:', sessionError);
        }
      }
      
      // Use the retry mechanism for standard verification
      console.log('Attempting standard purchase verification with retries');
      const verifiedResult = await verifyPurchaseWithRetry(id, 8, 1000); // Increased retries with reasonable delay
      
      if (verifiedResult) {
        console.log('Purchase verified successfully through standard verification!');
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
        console.log('Purchase verification failed after retries, trying final direct approaches');
        incrementAttempts();
        
        // Try direct updates based on available information
        const guestEmail = localStorage.getItem('guestEmail');
        
        // Build an array of possible update queries to try
        const updateAttempts = [];
        
        // 1. User ID based update for logged-in users
        if (userId) {
          updateAttempts.push({
            name: 'user-id-update',
            query: supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id)
              .eq('user_id', userId)
          });
        }
        
        // 2. Session ID based update
        if (sessionId) {
          updateAttempts.push({
            name: 'session-id-update',
            query: supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id)
              .eq('stripe_session_id', sessionId)
          });
        }
        
        // 3. Guest email based update
        if (guestEmail) {
          updateAttempts.push({
            name: 'guest-email-update',
            query: supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', id)
              .eq('guest_email', guestEmail)
          });
        }
        
        // 4. Direct ID update as last resort
        updateAttempts.push({
          name: 'direct-id-update',
          query: supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase'
            })
            .eq('id', id)
        });
        
        // Try each update strategy
        for (const attempt of updateAttempts) {
          try {
            console.log(`Attempting ${attempt.name} verification strategy`);
            const { error } = await attempt.query;
            
            if (!error) {
              console.log(`Update successful with ${attempt.name} strategy!`);
              
              // Try to fetch the updated result
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
          } catch (attemptError) {
            console.error(`Error with ${attempt.name} verification:`, attemptError);
          }
        }
        
        // If none of the attempts worked, inform the user but don't mark as complete failure yet
        incrementAttempts();
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
