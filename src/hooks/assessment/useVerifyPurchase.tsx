import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { cleanupPurchaseState, storePurchaseData } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useVerificationStrategies } from "./verification/useVerificationStrategies";
import { useResultFetchingStrategies } from "./verification/useResultFetchingStrategies";

/**
 * Hook to handle purchase verification
 */
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
  } = useVerificationStrategies();
  
  const { 
    fetchUserResult, 
    fetchResultBySessionId, 
    fetchResultById 
  } = useResultFetchingStrategies();

  /**
   * Main verification function that orchestrates verification process
   */
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
      if (userId && successParam === 'true') {
        console.log('Logged-in user detected, attempting direct verification for user:', userId);
        
        // Try multiple strategies for logged-in users

        // Strategy 1: Direct update by user ID and result ID
        console.log('Strategy 1: Trying direct update by user ID and result ID');
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
            storePurchaseData(id, sessionId || '');
            return true;
          }
        }
        
        // Strategy 2: Try to update the result using just the result ID
        // This is important for logged-in users who just completed an assessment
        console.log('Strategy 2: Trying update by result ID only for logged-in user');
        await supabase
          .from('quiz_results')
          .update({
            user_id: userId, // Ensure user ID is associated with this result
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', id);
          
        // Check if this succeeded
        const { data: directResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (directResult) {
          console.log('Successfully updated result for logged-in user via direct result ID');
          setResult(directResult);
          setLoading(false);
          stopVerification();
          toast({
            title: "Purchase verified!",
            description: "Your detailed report is now available.",
          });
          storePurchaseData(id, sessionId || '');
          return true;
        }
      }
      
      // For cases with a session ID, regardless of user state
      if (sessionId) {
        console.log('Attempting verification with session ID:', sessionId);
        
        // Strategy 3: Update result with session ID
        console.log('Strategy 3: Updating with session ID');
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
            storePurchaseData(id, sessionId);
            return true;
          }
        }
      }
      
      // Strategy 4: Use the standard retry mechanism
      console.log('Strategy 4: Attempting standard purchase verification with retries');
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
        storePurchaseData(id, sessionId || '');
        
        return true;
      } else {
        console.log('Purchase verification failed after retries, trying final direct approaches');
        incrementAttempts();
        
        // Strategy 5: Try direct updates based on available information
        console.log('Strategy 5: Attempting fallback updates');
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
          const finalResult = await fetchResultById(id);
              
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
