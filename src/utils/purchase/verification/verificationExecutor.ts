
/**
 * Handles the execution flow of verification strategies
 */
import { QuizResult } from "@/types/quiz";
import { getStoredPurchaseData } from "../helpers/verificationHelpers";
import { 
  verifyWithUserId,
  verifyWithGuestToken,
  verifyWithGuestEmail,
  verifyWithStripeSession,
  forceUpdatePurchaseStatus
} from "./strategies";
import { 
  logVerificationAttempt, 
  checkIfAlreadyPurchased, 
  handleVerificationDelay,
  getVerificationUrlParams
} from "./helpers/verificationCoordinator";

/**
 * Execute verification with retry logic
 */
export const executeVerification = async (
  resultId: string, 
  maxRetries = 5, 
  currentRetry = 0
): Promise<QuizResult | null> => {
  logVerificationAttempt(resultId, currentRetry + 1, maxRetries);
  
  if (!resultId) {
    console.error('[ERROR] No result ID provided for verification');
    return null;
  }
  
  try {
    // Log URL parameters to check for success=true
    const { success, sessionId } = getVerificationUrlParams();
    console.log(`[DEBUG] URL parameters: success=${success}, session_id=${sessionId}`);
    
    // Check if result is already purchased
    const alreadyPurchased = await checkIfAlreadyPurchased(resultId);
    if (alreadyPurchased) return alreadyPurchased;
    
    // Get current stored data
    const storedData = getStoredPurchaseData();
    console.log('[DEBUG] Stored purchase data:', storedData);
    
    // Add session ID from URL if available
    if (sessionId && !storedData.stripeSessionId) {
      console.log(`[DEBUG] Using session ID from URL: ${sessionId}`);
      localStorage.setItem('stripeSessionId', sessionId);
      
      // Update stored data with new session ID
      storedData.stripeSessionId = sessionId;
    }
    
    // Step 1: Try to verify with user ID if available
    if (storedData.checkoutUserId) {
      console.log(`[DEBUG] Attempting verification with user ID: ${storedData.checkoutUserId}`);
      const userResult = await verifyWithUserId(resultId, storedData.checkoutUserId);
      if (userResult) {
        console.log('[DEBUG] Verification with user ID successful');
        return userResult;
      } else {
        console.log('[DEBUG] Verification with user ID failed');
      }
    }
    
    // Step 2: Try to verify with guest token if available
    if (storedData.guestAccessToken) {
      console.log(`[DEBUG] Attempting verification with guest token: ${storedData.guestAccessToken}`);
      const guestTokenResult = await verifyWithGuestToken(resultId, storedData.guestAccessToken);
      if (guestTokenResult) {
        console.log('[DEBUG] Verification with guest token successful');
        return guestTokenResult;
      } else {
        console.log('[DEBUG] Verification with guest token failed');
      }
    }
    
    // Step 3: Try to verify with guest email if available
    if (storedData.guestEmail) {
      console.log(`[DEBUG] Attempting verification with guest email: ${storedData.guestEmail}`);
      const guestEmailResult = await verifyWithGuestEmail(resultId, storedData.guestEmail);
      if (guestEmailResult) {
        console.log('[DEBUG] Verification with guest email successful');
        return guestEmailResult;
      } else {
        console.log('[DEBUG] Verification with guest email failed');
      }
    }
    
    // Step 4: Try to verify with stripe session if available
    if (storedData.stripeSessionId) {
      console.log(`[DEBUG] Attempting verification with Stripe session ID: ${storedData.stripeSessionId}`);
      const stripeResult = await verifyWithStripeSession(resultId, storedData.stripeSessionId);
      if (stripeResult) {
        console.log('[DEBUG] Verification with Stripe session successful');
        return stripeResult;
      } else {
        console.log('[DEBUG] Verification with Stripe session failed');
      }
    }
    
    // Check if direct verification with session ID from URL is possible
    if (sessionId && sessionId !== storedData.stripeSessionId) {
      console.log(`[DEBUG] Attempting verification with session ID from URL: ${sessionId}`);
      const urlSessionResult = await verifyWithStripeSession(resultId, sessionId);
      if (urlSessionResult) {
        console.log('[DEBUG] Verification with URL session ID successful');
        return urlSessionResult;
      } else {
        console.log('[DEBUG] Verification with URL session ID failed');
      }
    }
    
    // Step 5: If we've tried max times, force the update as a last resort
    if (currentRetry >= maxRetries - 1) {
      console.log('[DEBUG] Maximum verification attempts reached, forcing update');
      const forceResult = await forceUpdatePurchaseStatus(resultId);
      if (forceResult) {
        console.log('[DEBUG] Force update successful');
      } else {
        console.log('[DEBUG] Force update failed');
      }
      return forceResult;
    }
    
    // If we got here, retry with backoff
    await handleVerificationDelay(currentRetry);
    
    return executeVerification(resultId, maxRetries, currentRetry + 1);
  } catch (error) {
    console.error('[ERROR] Error during verification process:', error);
    
    // If failed but have retries left, try again
    if (currentRetry < maxRetries - 1) {
      const delay = Math.pow(2, currentRetry) * 1000;
      console.log(`[DEBUG] Verification error, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeVerification(resultId, maxRetries, currentRetry + 1);
    }
    
    return null;
  }
};
