
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
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 20, delayMs = 1500) => {
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Get stored session data from localStorage
    const trackingId = localStorage.getItem('purchaseTrackingId');
    const guestAccessToken = localStorage.getItem('guestAccessToken');
    const stripeSessionId = localStorage.getItem('stripeSessionId');
    const guestEmail = localStorage.getItem('guestEmail');
    
    console.log('Starting purchase verification:', { 
      resultId, 
      userId: userId || 'guest',
      hasTrackingId: !!trackingId,
      hasGuestToken: !!guestAccessToken,
      hasStripeSession: !!stripeSessionId,
      hasGuestEmail: !!guestEmail,
      maxRetries, 
      delayMs 
    });

    // Direct query to check if the purchase is already completed
    const directQuery = supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId);
    
    const { data: directResult } = await directQuery.maybeSingle();

    if (directResult && isPurchased(directResult)) {
      console.log('Purchase already verified via direct check');
      return directResult;
    }

    // Initial attempts - these might succeed immediately
    
    // 1. Try to verify by tracking ID
    if (trackingId) {
      const trackingResult = await checkPurchaseTracking(trackingId, resultId);
      if (trackingResult) {
        console.log('Purchase verified via tracking record', trackingId);
        return trackingResult;
      }
    }
    
    // 2. Try to update with session ID
    if (stripeSessionId) {
      const updated = await updateResultWithPurchase(resultId, stripeSessionId);
      if (updated) {
        const result = await fetchResult(resultId, userId, guestAccessToken);
        if (result && isPurchased(result)) {
          console.log('Purchase verified via direct update with stripe session', stripeSessionId);
          return result;
        }
      }
    }

    // 3. Try to verify by guest email for guests
    if (!userId && guestEmail) {
      console.log('Attempting guest verification with email:', guestEmail);
      const { data: guestResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', guestEmail)
        .maybeSingle();
      
      if (guestResult && isPurchased(guestResult)) {
        console.log('Purchase verified via guest email match');
        return guestResult;
      }
    }

    // 4. Try manual Stripe session check
    if (stripeSessionId) {
      const query = buildQuery(resultId, userId, guestAccessToken);
      const manualCheckResult = await manuallyCheckStripeSession(stripeSessionId, resultId, query);
      if (manualCheckResult) {
        console.log('Purchase verified via manual stripe session check', stripeSessionId);
        return manualCheckResult;
      }
    }

    // If initial attempts failed, start retry loop with different strategies
    for (let i = 0; i < maxRetries; i++) {
      console.log(`Verification attempt ${i + 1} of ${maxRetries}`);
      
      // Build query based on authentication state
      let query = supabase.from('quiz_results').select('*').eq('id', resultId);
      
      // Attempt 1: Try using user ID if available
      if (userId) {
        query = query.eq('user_id', userId);
        
        try {
          const { data: result, error } = await query.maybeSingle();
          if (!error && result && isPurchased(result)) {
            console.log('Purchase verified via user ID on attempt', i + 1);
            return result;
          }
        } catch (error) {
          console.error('Error in user verification:', error);
        }
      }
      
      // Attempt 2: Try using guest access token
      if (guestAccessToken) {
        query = supabase.from('quiz_results').select('*')
          .eq('id', resultId)
          .eq('guest_access_token', guestAccessToken);
          
        try {
          const { data: result, error } = await query.maybeSingle();
          if (!error && result && isPurchased(result)) {
            console.log('Purchase verified via guest token on attempt', i + 1);
            return result;
          }
        } catch (error) {
          console.error('Error in guest token verification:', error);
        }
      }
      
      // Attempt 3: Try using guest email
      if (guestEmail) {
        query = supabase.from('quiz_results').select('*')
          .eq('id', resultId)
          .eq('guest_email', guestEmail);
          
        try {
          const { data: result, error } = await query.maybeSingle();
          if (!error && result && isPurchased(result)) {
            console.log('Purchase verified via guest email on attempt', i + 1);
            return result;
          }
        } catch (error) {
          console.error('Error in guest email verification:', error);
        }
      }
      
      // Attempt 4: Try using stripe session id
      if (stripeSessionId) {
        query = supabase.from('quiz_results').select('*')
          .eq('id', resultId)
          .eq('stripe_session_id', stripeSessionId);
          
        try {
          const { data: result, error } = await query.maybeSingle();
          if (!error && result && isPurchased(result)) {
            console.log('Purchase verified via stripe session on attempt', i + 1);
            return result;
          }
          
          // If no result, try to update it directly
          if (!error && result && i > 2) {
            const updated = await updateResultWithPurchase(resultId, stripeSessionId);
            if (updated) {
              const { data: updatedResult } = await query.maybeSingle();
              if (updatedResult && isPurchased(updatedResult)) {
                console.log('Purchase verified via manual update on attempt', i + 1);
                return updatedResult;
              }
            }
          }
        } catch (error) {
          console.error('Error in stripe session verification:', error);
        }
      }
      
      // Check purchase tracking again
      if (trackingId) {
        try {
          const trackingResult = await checkPurchaseTracking(trackingId, resultId);
          if (trackingResult) {
            console.log('Purchase verified via tracking record on attempt', i + 1);
            return trackingResult;
          }
        } catch (error) {
          console.error('Error checking purchase tracking:', error);
        }
      }
      
      // Direct attempt to check if quiz result is purchased
      try {
        const { data: directResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId)
          .maybeSingle();
          
        if (directResult && isPurchased(directResult)) {
          console.log('Purchase verified via direct check on attempt', i + 1);
          return directResult;
        }
      } catch (error) {
        console.error('Error in direct check:', error);
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
const buildQuery = (resultId: string, userId?: string, guestAccessToken?: string | null, guestEmail?: string | null) => {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId);
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestAccessToken) {
    query = query.eq('guest_access_token', guestAccessToken);
  } else if (guestEmail) {
    query = query.eq('guest_email', guestEmail);
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
