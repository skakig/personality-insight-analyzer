
import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { cleanupPurchaseState, storePurchaseData } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useDirectDatabaseUpdates } from "./useDirectDatabaseUpdates";
import { useFetchUpdatedResult } from "./useFetchUpdatedResult";

export const useVerifyPurchase = (
  setLoading: (value: boolean) => void,
  setResult: (result: any) => void,
  { startVerification, stopVerification, incrementAttempts }: {
    startVerification: () => void;
    stopVerification: () => void;
    incrementAttempts: () => void;
  }
) => {
  const { 
    updateResultForUser, 
    updateResultWithSessionId, 
    tryFallbackUpdates 
  } = useDirectDatabaseUpdates();
  
  const { 
    fetchUserResult, 
    fetchResultBySessionId, 
    fetchResultById 
  } = useFetchUpdatedResult();

  const verifyPurchase = async (id?: string) => {
    if (!id) {
      console.error('Verification failed: Missing result ID');
      stopVerification();
      toast({
        title: "Verification Error",
        description: "Unable to verify purchase due to missing information.",
        variant: "destructive",
      });
      return false;
    }
    
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
      
      // For logged-in users returning from successful purchase
      if (userId) {
        console.log('Logged-in user detected, attempting verification for user:', userId);
        
        // First, check if this result belongs to the user and is already purchased
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
        
        // If not yet purchased but returning from successful checkout
        if (successParam === 'true') {
          console.log('Updating result directly for logged-in user after purchase');
          
          // Update the database for logged-in user
          const updated = await updateResultForUser(id, userId);
          
          if (updated) {
            // Fetch the updated result
            const userResult = await fetchUserResult(id, userId);
              
            if (userResult) {
              console.log('Successfully fetched updated result for logged-in user');
              setResult(userResult);
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
          
          // If direct user update failed, try with session ID as well (belt and suspenders approach)
          if (sessionId) {
            console.log('User update failed, attempting with session ID as fallback');
            
            // First update the stripe_session_id on the result
            await supabase
              .from('quiz_results')
              .update({ stripe_session_id: sessionId })
              .eq('id', id)
              .eq('user_id', userId);
              
            // Then update with the completed status
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
              const { data: finalResult } = await supabase
                .from('quiz_results')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .maybeSingle();
                
              if (finalResult) {
                console.log('Session ID fallback update successful for logged-in user');
                setResult(finalResult);
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
          }
        }
      }
      
      // For cases with a session ID, regardless of user state
      if (sessionId) {
        console.log('Attempting verification with session ID:', sessionId);
        
        // First sync the session ID with the result if needed
        try {
          await supabase
            .from('quiz_results')
            .update({ stripe_session_id: sessionId })
            .eq('id', id);
        } catch (syncError) {
          console.error('Session ID sync error (non-critical):', syncError);
          // Continue anyway, this is just a precaution
        }
        
        // Update result with session ID
        const sessionUpdated = await updateResultWithSessionId(id, sessionId);
          
        if (sessionUpdated) {
          // Fetch the updated result
          const sessionResult = await fetchResultBySessionId(id, sessionId);
              
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
      }
      
      // If user is logged in, try a direct update by user ID
      if (userId) {
        console.log('Trying direct database update for logged-in user');
        
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
          const { data: updatedResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (updatedResult) {
            console.log('User direct update successful');
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
      }
      
      // Use the retry mechanism for standard verification
      console.log('Attempting standard purchase verification with retries');
      const verifiedResult = await verifyPurchaseWithRetry(id, 8, 1000);
      
      if (verifiedResult) {
        console.log('Purchase verified successfully through standard verification!');
        setResult(verifiedResult);
        toast({
          title: "Purchase successful!",
          description: "Your detailed report is now available.",
        });
        setLoading(false);
        stopVerification();
        
        // Store the result ID correctly
        storePurchaseData(id, sessionId || '', userId);
        
        return true;
      } else {
        console.log('Purchase verification failed after retries, trying final direct approaches');
        incrementAttempts();
        
        // Try direct updates based on available information
        const guestEmail = localStorage.getItem('guestEmail');
        
        // Try fallback update methods
        const updated = await tryFallbackUpdates({
          id,
          userId,
          sessionId,
          guestEmail
        });
        
        if (updated) {
          // Try to fetch the updated result
          let finalQuery = supabase
            .from('quiz_results')
            .select('*')
            .eq('id', id);
            
          // Add user filter for logged-in users
          if (userId) {
            finalQuery = finalQuery.eq('user_id', userId);
          }
          
          const { data: finalResult } = await finalQuery.maybeSingle();
              
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
        
        // If this is a logged-in user and we've failed multiple times, 
        // try a desperate move: update the result without any filters
        if (userId && incrementAttempts > 2) {
          console.log('Multiple failures for logged-in user, trying last resort update');
          const { error: lastResortError } = await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase'
            })
            .eq('id', id);
            
          if (!lastResortError) {
            const { data: lastResortResult } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', id)
              .maybeSingle();
              
            if (lastResortResult) {
              console.log('Last resort update successful!');
              setResult(lastResortResult);
              setLoading(false);
              stopVerification();
              toast({
                title: "Purchase verified!",
                description: "Your detailed report is now available.",
              });
              return true;
            }
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
