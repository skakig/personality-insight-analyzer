
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { getStoredPurchaseData } from "./helpers";
import { 
  executeImmediateVerificationStrategies,
  executeRetryVerificationStrategies,
  executeFallbackVerification
} from "./verificationStrategies";

/**
 * Core verification function that orchestrates all verification strategies
 */
export const executeVerification = async (resultId: string, maxRetries = 5, delayMs = 1000) => {
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Get stored session data from localStorage
    const { 
      trackingId, 
      guestAccessToken, 
      stripeSessionId, 
      guestEmail, 
      storedResultId,
      checkoutUserId
    } = getStoredPurchaseData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlSuccess = urlParams.get('success') === 'true';
    const urlSessionId = urlParams.get('session_id');
    
    // If we have a session ID in the URL but not in localStorage, store it
    const sessionIdToUse = urlSessionId || stripeSessionId;
    if (urlSessionId && !stripeSessionId) {
      localStorage.setItem('stripeSessionId', urlSessionId);
      console.log('Stored session ID from URL parameters');
    }
    
    console.log('Starting purchase verification:', { 
      resultId, 
      userId: userId || checkoutUserId || 'guest',
      hasTrackingId: !!trackingId,
      hasGuestToken: !!guestAccessToken,
      hasStripeSession: !!sessionIdToUse,
      hasGuestEmail: !!guestEmail,
      urlSuccess,
      urlSessionId,
      maxRetries, 
      delayMs 
    });

    // Quick verification attempt for users just returning from Stripe checkout
    if (urlSuccess && sessionIdToUse) {
      console.log('Detected return from successful checkout, attempting fast verification');
      
      try {
        // For logged-in users, we can update directly with the user ID
        if (userId || checkoutUserId) {
          console.log('Attempting direct update for logged-in user');
          const userIdToUse = userId || checkoutUserId;
          
          await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              user_id: userIdToUse // Ensure the result is linked to the user
            })
            .eq('id', resultId);
            
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (result && isPurchased(result)) {
            console.log('Fast purchase verification successful!');
            return result;
          }
        }
        
        // For guest users
        if (guestEmail) {
          console.log('Attempting direct update for guest user');
          await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              guest_email: guestEmail
            })
            .eq('id', resultId);
            
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (result && isPurchased(result)) {
            console.log('Fast purchase verification successful for guest!');
            return result;
          }
        }
      } catch (fastError) {
        console.error('Fast verification attempt failed:', fastError);
      }
    }

    // Direct query to check if the purchase is already completed
    const { data: directResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();

    if (directResult && isPurchased(directResult)) {
      console.log('Purchase already verified via direct check');
      return directResult;
    }

    // Execute immediate verification strategies
    const immediateResult = await executeImmediateVerificationStrategies(
      resultId,
      userId || checkoutUserId,
      trackingId,
      sessionIdToUse,
      guestAccessToken,
      guestEmail
    );
    
    if (immediateResult) {
      return immediateResult;
    }

    // Execute retry-based verification strategies
    const retryResult = await executeRetryVerificationStrategies(
      resultId,
      maxRetries,
      delayMs,
      userId || checkoutUserId,
      trackingId,
      sessionIdToUse,
      guestAccessToken,
      guestEmail
    );
    
    if (retryResult) {
      return retryResult;
    }

    // Last resort: direct check without any filters
    const fallbackResult = await executeFallbackVerification(resultId);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    console.log('Purchase verification failed after maximum retries');
    return null;
  } catch (error) {
    console.error('Purchase verification error:', error);
    return null;
  }
};
