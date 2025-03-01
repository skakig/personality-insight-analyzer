
import { toast } from "@/hooks/use-toast";
import { cleanupPurchaseState } from "@/utils/purchaseStateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useBasicVerificationStrategies } from "./verification/useBasicVerificationStrategies";
import { useFallbackVerificationStrategies } from "./verification/useFallbackVerificationStrategies";
import { useDatabaseUpdateStrategies } from "./verification/useDatabaseUpdateStrategies";
import { useResultFetchingStrategies } from "./verification/useResultFetchingStrategies";

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
  // Import all the verification strategies
  const { 
    verifyForLoggedInUser, 
    verifyWithSessionId 
  } = useBasicVerificationStrategies(setResult, setLoading, stopVerification);
  
  const { 
    performStandardVerification, 
    performLastResortVerification 
  } = useFallbackVerificationStrategies(setResult, setLoading, stopVerification, incrementAttempts);
  
  const { 
    updateForCheckoutSuccess 
  } = useDatabaseUpdateStrategies();
  
  const { 
    fetchByUserId, 
    fetchBySessionId, 
    fetchById 
  } = useResultFetchingStrategies();

  /**
   * Main verification function that coordinates all verification strategies
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
    
    // Get URL parameters and session info
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
      // Check for logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log('User context:', {
        isLoggedIn: !!userId,
        userId: userId || 'guest',
        verificationAttempts
      });
      
      // STRATEGY 1: For logged-in users returning from successful purchase
      if (userId && successParam === 'true') {
        console.log('Strategy 1: Logged-in user with success param');
        
        // Try direct database update
        const updateSuccess = await updateForCheckoutSuccess(id, userId, sessionId);
        if (updateSuccess) {
          const userResult = await fetchByUserId(id, userId);
          if (userResult) {
            console.log('Strategy 1 successful: User direct update');
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
        
        // Try user verification
        const userVerified = await verifyForLoggedInUser(id, userId, sessionId);
        if (userVerified) {
          console.log('Strategy 1 successful: User verification');
          return true;
        }
        
        // If session ID available, try that too
        if (sessionId) {
          const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
          if (sessionVerified) {
            console.log('Strategy 1 successful: Session verification');
            return true;
          }
        }
      }
      
      // STRATEGY 2: Direct user verification for logged-in users (without success param)
      if (userId) {
        console.log('Strategy 2: Direct user verification');
        const userVerified = await verifyForLoggedInUser(id, userId, sessionId);
        if (userVerified) {
          console.log('Strategy 2 successful');
          return true;
        }
      }
      
      // STRATEGY 3: Session ID verification for any user type
      if (sessionId) {
        console.log('Strategy 3: Session ID verification');
        const sessionVerified = await verifyWithSessionId(id, sessionId, userId);
        if (sessionVerified) {
          console.log('Strategy 3 successful');
          return true;
        }
      }
      
      // STRATEGY 4: Standard verification with retries
      console.log('Strategy 4: Standard verification with retries');
      const standardVerified = await performStandardVerification(id, sessionId, userId);
      if (standardVerified) {
        console.log('Strategy 4 successful');
        return true;
      }
      
      // STRATEGY 5: Last resort verification for high attempt counts
      if (verificationAttempts > 2) {
        console.log('Strategy 5: Last resort verification');
        const lastResortSuccess = await performLastResortVerification(id, userId, sessionId);
        if (lastResortSuccess) {
          console.log('Strategy 5 successful');
          return true;
        }
      }
      
      // If all strategies fail, increment attempts and try again
      console.log('All verification strategies failed, incrementing attempts');
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
