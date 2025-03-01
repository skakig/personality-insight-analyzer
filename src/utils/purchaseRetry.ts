
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
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5, delayMs = 1000) => {
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Get stored session data from localStorage
    const trackingId = localStorage.getItem('purchaseTrackingId');
    const guestAccessToken = localStorage.getItem('guestAccessToken');
    const stripeSessionId = localStorage.getItem('stripeSessionId');
    const guestEmail = localStorage.getItem('guestEmail');
    const urlParams = new URLSearchParams(window.location.search);
    const urlSuccess = urlParams.get('success') === 'true';
    const urlSessionId = urlParams.get('session_id');
    
    // If we have a session ID in the URL but not in localStorage, store it
    if (urlSessionId && !stripeSessionId) {
      localStorage.setItem('stripeSessionId', urlSessionId);
      console.log('Stored session ID from URL parameters');
    }
    
    console.log('Starting purchase verification:', { 
      resultId, 
      userId: userId || 'guest',
      hasTrackingId: !!trackingId,
      hasGuestToken: !!guestAccessToken,
      hasStripeSession: !!stripeSessionId,
      hasGuestEmail: !!guestEmail,
      urlSuccess,
      urlSessionId,
      maxRetries, 
      delayMs 
    });

    // Quick verification attempt for users just returning from Stripe checkout
    if (urlSuccess && (urlSessionId || stripeSessionId)) {
      console.log('Detected return from successful checkout, attempting fast verification');
      const sessionIdToUse = urlSessionId || stripeSessionId;
      
      try {
        const query = buildQuery(resultId, userId);
        
        // For logged-in users, we can update directly with the user ID
        if (userId) {
          console.log('Attempting direct update for logged-in user');
          await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase'
            })
            .eq('id', resultId)
            .eq('user_id', userId);
        }
        
        // Also try updating by session ID
        if (sessionIdToUse) {
          console.log('Attempting update by session ID');
          await updateResultWithPurchase(resultId, sessionIdToUse);
        }
        
        const { data: result } = await query.maybeSingle();
        if (result && isPurchased(result)) {
          console.log('Fast purchase verification successful!');
          return result;
        }
      } catch (fastError) {
        console.error('Fast verification attempt failed:', fastError);
      }
    }

    // Direct query to check if the purchase is already completed
    const directQuery = supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId);
    
    // Add user filter if logged in
    const userFilter = userId ? 
      directQuery.eq('user_id', userId) : 
      directQuery;
    
    const { data: directResult } = await userFilter.maybeSingle();

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
      
      // For logged-in users, try a direct user ID check first (most reliable)
      if (userId) {
        try {
          const { data: userResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (userResult && isPurchased(userResult)) {
            console.log('Purchase verified via user ID on attempt', i + 1);
            return userResult;
          }
          
          // If user ID check failed but we have a session ID, try force updating
          if (stripeSessionId && i > 1) {
            console.log('Attempting forced update for logged-in user with session ID');
            await supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                is_detailed: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', resultId)
              .eq('user_id', userId);
              
            const { data: updatedResult } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', resultId)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (updatedResult && isPurchased(updatedResult)) {
              console.log('Forced update successful!');
              return updatedResult;
            }
          }
        } catch (userError) {
          console.error('Error in user verification:', userError);
        }
      }
      
      // Try using guest access token
      if (guestAccessToken) {
        try {
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .eq('guest_access_token', guestAccessToken)
            .maybeSingle();
          
          if (result && isPurchased(result)) {
            console.log('Purchase verified via guest token on attempt', i + 1);
            return result;
          }
        } catch (error) {
          console.error('Error in guest token verification:', error);
        }
      }
      
      // Try using guest email
      if (guestEmail) {
        try {
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .eq('guest_email', guestEmail)
            .maybeSingle();
          
          if (result && isPurchased(result)) {
            console.log('Purchase verified via guest email on attempt', i + 1);
            return result;
          }
        } catch (error) {
          console.error('Error in guest email verification:', error);
        }
      }
      
      // Try using stripe session id
      if (stripeSessionId) {
        try {
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .eq('stripe_session_id', stripeSessionId)
            .maybeSingle();
          
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
      
      // Wait before the next attempt
      await sleep(delayMs);
    }
    
    // Last resort: direct check without any filters
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
