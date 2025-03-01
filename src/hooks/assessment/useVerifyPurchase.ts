
import { toast } from "@/hooks/use-toast";
import { cleanupPurchaseState } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useDirectDatabaseUpdates } from "./useDirectDatabaseUpdates";
import { useFetchUpdatedResult } from "./useFetchUpdatedResult";
import { useVerificationStrategies } from "./verification/useVerificationStrategies";
import { useStandardVerification } from "./verification/useStandardVerification";

export const useVerifyPurchase = (
  setLoading: (value: boolean) => void,
  setResult: (result: any) => void,
  { startVerification, stopVerification, incrementAttempts, verificationAttempts }: {
    startVerification: () => void;
    stopVerification: () => void;
    incrementAttempts: () => void;
    verificationAttempts: number;
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

  const {
    verifyForLoggedInUser,
    verifyWithSessionId,
    performFallbackVerification
  } = useVerificationStrategies(setResult, setLoading, stopVerification);
  
  const {
    performStandardVerification
  } = useStandardVerification(setResult, setLoading, stopVerification, incrementAttempts);

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
        // If returning from successful checkout with a user ID
        if (successParam === 'true') {
          // Try verification with user ID
          const userVerified = await verifyForLoggedInUser(id, userId, sessionId);
          if (userVerified) return true;
          
          // If direct user update failed and we have a session ID, try with that
          if (sessionId) {
            const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
            if (sessionVerified) return true;
          }
        }
        
        // Try a direct update by user ID
        const directUpdateSuccess = await updateResultForUser(id, userId);
        if (directUpdateSuccess) {
          const userResult = await fetchUserResult(id, userId);
          if (userResult) {
            console.log('User direct update successful');
            setResult(userResult);
            setLoading(false);
            stopVerification();
            toast({
              title: "Purchase verified!",
              description: "Your detailed report is now available.",
            });
            if (sessionId) {
              cleanupPurchaseState();
            }
            return true;
          }
        }
      }
      
      // If we have a session ID, try verification with that
      if (sessionId) {
        const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
        if (sessionVerified) return true;
      }
      
      // Use the standard retry mechanism if initial strategies fail
      const standardVerified = await performStandardVerification(id, sessionId, userId);
      if (standardVerified) return true;
      
      // Try direct updates based on available information
      const guestEmail = localStorage.getItem('guestEmail');
      
      // Try fallback update methods
      const fallbackSuccess = await tryFallbackUpdates({
        id,
        userId,
        sessionId,
        guestEmail
      });
      
      if (fallbackSuccess) {
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
      
      // Last resort: direct verification without filters
      if (userId && verificationAttempts > 2) {
        const lastResortSuccess = await performFallbackVerification(id, userId, sessionId);
        if (lastResortSuccess) return true;
      }
      
      // If none of the attempts worked, increment attempts and continue
      incrementAttempts();
      return false;
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
