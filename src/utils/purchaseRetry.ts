
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";
import { checkPurchaseTracking, updateResultWithPurchase, manuallyCheckStripeSession } from "./purchaseVerification";

/**
 * Sleep utility function for retry mechanism
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verifies a purchase with retry mechanism
 * Attempts multiple times to verify if a purchase was completed
 */
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 15, delayMs = 2000) => {
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Get stored session data from localStorage
    const trackingId = localStorage.getItem('purchaseTrackingId');
    const guestAccessToken = localStorage.getItem('guestAccessToken');
    const stripeSessionId = localStorage.getItem('stripeSessionId');
    
    console.log('Starting purchase verification:', { 
      resultId, 
      userId: userId || 'guest',
      hasTrackingId: !!trackingId,
      hasGuestToken: !!guestAccessToken,
      hasStripeSession: !!stripeSessionId,
      maxRetries, 
      delayMs 
    });

    // Initial attempts - these might succeed immediately
    
    // 1. Try to update the result status if we have a session ID
    if (stripeSessionId) {
      const updated = await updateResultWithPurchase(resultId, stripeSessionId);
      if (updated) {
        const result = await fetchResult(resultId, userId, guestAccessToken);
        if (result && isPurchased(result)) {
          return result;
        }
      }
    }

    // 2. Try to check tracking status if we have a tracking ID
    if (trackingId) {
      const trackingResult = await checkPurchaseTracking(trackingId, resultId);
      if (trackingResult) {
        return trackingResult;
      }
    }

    // 3. Try manually checking the Stripe session
    if (stripeSessionId) {
      const query = buildQuery(resultId, userId, guestAccessToken);
      const manualCheckResult = await manuallyCheckStripeSession(stripeSessionId, resultId, query);
      if (manualCheckResult) {
        return manualCheckResult;
      }
    }

    // If initial attempts failed, start retry loop
    for (let i = 0; i < maxRetries; i++) {
      console.log(`Verification attempt ${i + 1} of ${maxRetries}`);
      
      // Build query based on authentication state
      const query = buildQuery(resultId, userId, guestAccessToken);
      
      try {
        const { data: result, error } = await query.maybeSingle();

        if (error) {
          console.error('Error in verification query:', error);
          // Continue retrying despite errors
        } else if (result && isPurchased(result)) {
          console.log('Purchase verified successfully on attempt', i + 1);
          return result;
        } else if (result && stripeSessionId && i > 2) {
          // If we found a result but it's not marked as purchased yet, try to update it
          console.log('Found result but not purchased. Attempting manual update...');
          
          const updated = await updateResultWithPurchase(resultId, stripeSessionId);
          if (updated) {
            const { data: updatedResult } = await query.maybeSingle();
            if (updatedResult && isPurchased(updatedResult)) {
              console.log('Manual update successful!');
              return updatedResult;
            }
          }
        }
      } catch (error) {
        console.error('Error during verification attempt:', error);
      }
      
      // Wait before the next attempt
      await sleep(delayMs);
    }
    
    console.log('Purchase verification failed after maximum retries');
    return null;
  } catch (error) {
    console.error('Purchase verification error:', error);
    return null;
  }
};

/**
 * Helper function to build the query based on authentication state
 */
const buildQuery = (resultId: string, userId?: string, guestAccessToken?: string | null) => {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId);
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestAccessToken) {
    query = query.eq('guest_access_token', guestAccessToken);
  }
  
  return query;
};

/**
 * Helper function to fetch a result by ID
 */
const fetchResult = async (resultId: string, userId?: string, guestAccessToken?: string | null) => {
  const query = buildQuery(resultId, userId, guestAccessToken);
  const { data: result, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Error fetching result:', error);
    return null;
  }
  
  return result;
};
