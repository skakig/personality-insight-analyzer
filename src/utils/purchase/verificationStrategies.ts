
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { checkPurchaseTracking, updateResultWithPurchase } from "../purchaseVerification";
import { 
  verifyWithUserId, 
  verifyWithGuestToken, 
  verifyWithGuestEmail, 
  verifyWithStripeSession,
  forceUpdateForUser,
  sleep
} from "./helpers";

/**
 * Execute immediate verification attempts - often succeed immediately
 */
export const executeImmediateVerificationStrategies = async (
  resultId: string, 
  userId?: string,
  trackingId?: string | null,
  stripeSessionId?: string | null,
  guestAccessToken?: string | null,
  guestEmail?: string | null
) => {
  console.log('Executing immediate verification strategies');
  
  // 1. Try to verify by tracking ID
  if (trackingId) {
    const trackingResult = await checkPurchaseTracking(trackingId, resultId);
    if (trackingResult && isPurchased(trackingResult)) {
      console.log('Purchase verified via tracking record', trackingId);
      return trackingResult;
    }
  }
  
  // 2. Try to update with session ID
  if (stripeSessionId) {
    const updated = await updateResultWithPurchase(resultId, stripeSessionId);
    if (updated) {
      // A new query needs to be created to fetch the updated result
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
      
      if (result && isPurchased(result)) {
        console.log('Purchase verified via direct update with stripe session', stripeSessionId);
        return result;
      }
    }
  }

  // 3. Try to verify by guest email for guests
  if (!userId && guestEmail) {
    console.log('Attempting guest verification with email:', guestEmail);
    const guestResult = await verifyWithGuestEmail(resultId, guestEmail);
    
    if (guestResult && isPurchased(guestResult)) {
      console.log('Purchase verified via guest email match');
      return guestResult;
    }
  }

  // 4. Try direct user ID check (for logged-in users)
  if (userId) {
    const userResult = await verifyWithUserId(resultId, userId);
    if (userResult && isPurchased(userResult)) {
      console.log('Purchase verified via user ID check');
      return userResult;
    }
  }

  return null;
};

/**
 * Execute iterative verification strategies with retries
 */
export const executeRetryVerificationStrategies = async (
  resultId: string,
  maxRetries: number,
  delayMs: number,
  userId?: string,
  trackingId?: string | null,
  stripeSessionId?: string | null,
  guestAccessToken?: string | null,
  guestEmail?: string | null
) => {
  // If initial attempts failed, start retry loop with different strategies
  for (let i = 0; i < maxRetries; i++) {
    console.log(`Verification attempt ${i + 1} of ${maxRetries}`);
    
    // For logged-in users, try a direct user ID check first (most reliable)
    if (userId) {
      const userResult = await verifyWithUserId(resultId, userId);
      if (userResult && isPurchased(userResult)) {
        console.log('Purchase verified via user ID on attempt', i + 1);
        return userResult;
      }
      
      // If user ID check failed but we have a session ID, try force updating
      if (stripeSessionId && i > 1) {
        const updatedResult = await forceUpdateForUser(resultId, userId);
        if (updatedResult && isPurchased(updatedResult)) {
          console.log('Forced update successful!');
          return updatedResult;
        }
      }
    }
    
    // Try using guest access token
    if (guestAccessToken) {
      const result = await verifyWithGuestToken(resultId, guestAccessToken);
      if (result && isPurchased(result)) {
        console.log('Purchase verified via guest token on attempt', i + 1);
        return result;
      }
    }
    
    // Try using guest email
    if (guestEmail) {
      const result = await verifyWithGuestEmail(resultId, guestEmail);
      if (result && isPurchased(result)) {
        console.log('Purchase verified via guest email on attempt', i + 1);
        return result;
      }
    }
    
    // Try using stripe session id
    if (stripeSessionId) {
      const result = await verifyWithStripeSession(resultId, stripeSessionId);
      if (result && isPurchased(result)) {
        console.log('Purchase verified via stripe session on attempt', i + 1);
        return result;
      }
      
      // If no result, try to update it directly
      if (i > 2) {
        const updated = await updateResultWithPurchase(resultId, stripeSessionId);
        if (updated) {
          const { data: updatedResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .eq('stripe_session_id', stripeSessionId)
            .maybeSingle();
          
          if (updatedResult && isPurchased(updatedResult)) {
            console.log('Purchase verified via manual update on attempt', i + 1);
            return updatedResult;
          }
        }
      }
    }
    
    // Check purchase tracking again
    if (trackingId) {
      const trackingResult = await checkPurchaseTracking(trackingId, resultId);
      if (trackingResult) {
        console.log('Purchase verified via tracking record on attempt', i + 1);
        return trackingResult;
      }
    }
    
    // Wait before the next attempt
    await sleep(delayMs);
  }

  return null;
};

/**
 * Final fallback verification - last resort direct check
 */
export const executeFallbackVerification = async (resultId: string) => {
  try {
    console.log('Attempting final direct check without filters');
    const { data: finalResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
    
    if (finalResult && isPurchased(finalResult)) {
      console.log('Purchase verified via final direct check');
      return finalResult;
    }
  } catch (finalError) {
    console.error('Final direct check failed:', finalError);
  }
  
  return null;
};
