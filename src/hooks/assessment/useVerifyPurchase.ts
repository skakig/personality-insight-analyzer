
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
      sessionIdValue: sessionId, // Log the actual session ID for debugging
      timestamp: new Date().toISOString()
    });

    try {
      // First try a direct session verification for logged-in users
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log('User context:', {
        isLoggedIn: !!userId,
        userId: userId || 'guest',
        verificationAttempts
      });
      
      // For logged-in users returning from successful purchase
      if (userId) {
        console.log('Logged-in user verification flow initiated');
        
        // If returning from successful checkout with a user ID
        if (successParam === 'true') {
          console.log('Success param detected, attempting direct user verification');
          
          // Try immediate database update for logged-in users returning from Stripe
          const directUpdateSuccess = await updateResultForUser(id, userId);
          if (directUpdateSuccess) {
            console.log('Direct user update successful without session ID filters');
            const userResult = await fetchUserResult(id, userId);
            if (userResult) {
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
          
          // Try verification with user ID as fallback
          const userVerified = await verifyForLoggedInUser(id, userId, sessionId);
          if (userVerified) {
            console.log('User verification successful');
            return true;
          }
          
          // If direct user update failed and we have a session ID, try with that
          if (sessionId) {
            console.log('Attempting session ID verification:', sessionId);
            const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
            if (sessionVerified) {
              console.log('Session verification successful');
              return true;
            }
          }
        }
        
        // Try a direct update by user ID
        console.log('Attempting direct user ID update without success param check');
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
        console.log('Attempting session-only verification with ID:', sessionId);
        const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
        if (sessionVerified) {
          console.log('Session-only verification successful');
          return true;
        }
        
        // Also try direct update with session ID
        const sessionUpdateSuccess = await updateResultWithSessionId(id, sessionId);
        if (sessionUpdateSuccess) {
          console.log('Direct session update successful');
          const sessionResult = await fetchResultBySessionId(id, sessionId);
          if (sessionResult) {
            setResult(sessionResult);
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
      
      // Use the standard retry mechanism if initial strategies fail
      const standardVerified = await performStandardVerification(id, sessionId, userId);
      if (standardVerified) {
        console.log('Standard verification successful');
        return true;
      }
      
      // Try direct updates based on available information
      const guestEmail = localStorage.getItem('guestEmail');
      
      // Try fallback update methods
      console.log('Attempting fallback updates');
      const fallbackSuccess = await tryFallbackUpdates({
        id,
        userId,
        sessionId,
        guestEmail
      });
      
      if (fallbackSuccess) {
        console.log('Fallback update successful');
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
        console.log('Last resort verification attempt');
        const lastResortSuccess = await performFallbackVerification(id, userId, sessionId);
        if (lastResortSuccess) {
          console.log('Last resort verification successful');
          return true;
        }
      }
      
      // If none of the attempts worked, increment attempts and continue
      console.log('All verification methods failed, incrementing attempts');
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
