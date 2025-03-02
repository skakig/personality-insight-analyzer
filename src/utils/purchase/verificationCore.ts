
/**
 * Core verification functionality
 */
import { supabase } from "@/integrations/supabase/client";
import { getStoredPurchaseData } from "./helpers/verificationHelpers";
import { 
  verifyWithUserId,
  verifyWithGuestToken,
  verifyWithGuestEmail,
  verifyWithStripeSession,
  forceUpdatePurchaseStatus
} from "./verification/strategies";
import { QuizResult } from "@/types/quiz";

/**
 * Execute verification with retry logic
 */
export const executeVerification = async (resultId: string, maxRetries = 5, currentRetry = 0): Promise<QuizResult | null> => {
  console.log(`[DEBUG] Attempting verification for result ${resultId} (attempt ${currentRetry + 1}/${maxRetries})`);
  
  if (!resultId) {
    console.error('[ERROR] No result ID provided for verification');
    return null;
  }
  
  try {
    // Log URL parameters to check for success=true
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    console.log(`[DEBUG] URL parameters: success=${success}, session_id=${sessionId}`);
    
    // Get current stored data
    const storedData = getStoredPurchaseData();
    console.log('[DEBUG] Stored purchase data:', storedData);
    
    // First, try a fast verification if returning from Stripe with success=true
    if (success === 'true') {
      console.log('[DEBUG] Success=true detected in URL, attempting fast checkout verification');
      
      // Directly fetch the result to check current state
      const currentResult = await fetchLatestResult(resultId);
      if (currentResult?.is_purchased) {
        console.log('[DEBUG] Result already marked as purchased, skipping verification');
        return currentResult;
      }
      
      // Add session ID from URL if available
      if (sessionId && !storedData.stripeSessionId) {
        console.log(`[DEBUG] Using session ID from URL: ${sessionId}`);
        localStorage.setItem('stripeSessionId', sessionId);
        
        // Update stored data with new session ID
        storedData.stripeSessionId = sessionId;
      }
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
    const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
    console.log(`[DEBUG] No verification methods succeeded, retrying in ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
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

/**
 * Fetch the latest result directly from the database
 */
export const fetchLatestResult = async (resultId: string): Promise<QuizResult | null> => {
  if (!resultId) return null;
  
  try {
    console.log(`[DEBUG] Fetching latest result for ID: ${resultId}`);
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (error) {
      console.error('[ERROR] Error fetching latest result:', error);
      return null;
    }
    
    if (!data) {
      console.log('[DEBUG] No data found for result ID');
      return null;
    }
    
    console.log('[DEBUG] Latest result data:', {
      id: data.id,
      is_purchased: data.is_purchased,
      purchase_status: data.purchase_status,
      stripe_session_id: data.stripe_session_id && data.stripe_session_id.substring(0, 10) + '...',
      guest_email: data.guest_email ? 'present' : 'null',
      user_id: data.user_id ? 'present' : 'null'
    });
    
    // Cast the data to the QuizResult type with proper type handling
    const result: QuizResult = {
      id: data.id,
      user_id: data.user_id,
      personality_type: data.personality_type,
      is_purchased: data.is_purchased || false,
      is_detailed: data.is_detailed || false,
      purchase_status: data.purchase_status,
      access_method: data.access_method,
      stripe_session_id: data.stripe_session_id,
      guest_email: data.guest_email,
      guest_access_token: data.guest_access_token,
      purchase_initiated_at: data.purchase_initiated_at,
      purchase_completed_at: data.purchase_completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
      detailed_analysis: data.detailed_analysis,
      category_scores: typeof data.category_scores === 'string' 
        ? JSON.parse(data.category_scores) as Record<string, number> 
        : data.category_scores as Record<string, number> | null,
      answers: data.answers,
      temp_access_token: data.temp_access_token,
      temp_access_expires_at: data.temp_access_expires_at,
      guest_access_expires_at: data.guest_access_expires_at,
      purchase_date: data.purchase_date,
      purchase_amount: data.purchase_amount,
      primary_level: data.primary_level,
      conversions: data.conversions
    };
    
    return result;
  } catch (error) {
    console.error('[ERROR] Error in fetchLatestResult:', error);
    return null;
  }
};
