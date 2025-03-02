
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
  console.log(`Attempting verification for result ${resultId} (attempt ${currentRetry + 1}/${maxRetries})`);
  
  if (!resultId) {
    console.error('No result ID provided for verification');
    return null;
  }
  
  try {
    // Get current stored data
    const storedData = getStoredPurchaseData();
    
    // Step 1: Try to verify with user ID if available
    if (storedData.checkoutUserId) {
      const userResult = await verifyWithUserId(resultId, storedData.checkoutUserId);
      if (userResult) return userResult;
    }
    
    // Step 2: Try to verify with guest token if available
    if (storedData.guestAccessToken) {
      const guestTokenResult = await verifyWithGuestToken(resultId, storedData.guestAccessToken);
      if (guestTokenResult) return guestTokenResult;
    }
    
    // Step 3: Try to verify with guest email if available
    if (storedData.guestEmail) {
      const guestEmailResult = await verifyWithGuestEmail(resultId, storedData.guestEmail);
      if (guestEmailResult) return guestEmailResult;
    }
    
    // Step 4: Try to verify with stripe session if available
    if (storedData.stripeSessionId) {
      const stripeResult = await verifyWithStripeSession(resultId, storedData.stripeSessionId);
      if (stripeResult) return stripeResult;
    }
    
    // Step 5: If we've tried max times, force the update as a last resort
    if (currentRetry >= maxRetries - 1) {
      console.log('Maximum verification attempts reached, forcing update');
      return await forceUpdatePurchaseStatus(resultId);
    }
    
    // If we got here, retry with backoff
    const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return executeVerification(resultId, maxRetries, currentRetry + 1);
  } catch (error) {
    console.error('Error during verification process:', error);
    
    // If failed but have retries left, try again
    if (currentRetry < maxRetries - 1) {
      const delay = Math.pow(2, currentRetry) * 1000;
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
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching latest result:', error);
      return null;
    }
    
    if (!data) return null;
    
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
      category_scores: data.category_scores as Record<string, number> | null,
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
    console.error('Error in fetchLatestResult:', error);
    return null;
  }
};
