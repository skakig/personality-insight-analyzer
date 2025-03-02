
import { supabase } from "@/integrations/supabase/client";
import { 
  executeImmediateVerificationStrategies,
  executeRetryVerificationStrategies,
  executeFallbackVerification
} from "./verificationStrategies";
import {
  getStoredPurchaseData,
  storeSessionIdFromUrl,
  getUrlVerificationParams,
  checkDirectPurchaseStatus,
  logVerificationParameters,
  attemptFastCheckoutVerification
} from "./helpers";

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
      checkoutUserId
    } = getStoredPurchaseData();
    
    // Get verification parameters from URL
    const { urlSuccess, urlSessionId } = getUrlVerificationParams();
    
    // Store session ID from URL if needed
    const urlStoredSessionId = storeSessionIdFromUrl();
    const sessionIdToUse = urlSessionId || urlStoredSessionId || stripeSessionId;
    
    // Log parameters for debugging
    logVerificationParameters({
      resultId,
      userId: userId || checkoutUserId,
      trackingId,
      sessionId: sessionIdToUse,
      guestToken: guestAccessToken,
      guestEmail,
      urlSuccess,
      maxRetries,
      delayMs
    });

    // Quick verification attempt for users just returning from Stripe checkout
    const fastVerificationResult = await attemptFastCheckoutVerification(
      resultId,
      sessionIdToUse,
      userId,
      checkoutUserId,
      guestEmail,
      urlSuccess
    );
    
    if (fastVerificationResult) {
      return fastVerificationResult;
    }

    // Direct query to check if the purchase is already completed
    const directResult = await checkDirectPurchaseStatus(resultId);
    if (directResult) {
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
