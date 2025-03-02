
/**
 * Helper functions for coordinating the verification process
 */
import { QuizResult } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { fetchLatestResult } from "../resultFetcher";

/**
 * Log verification attempt
 */
export const logVerificationAttempt = (resultId: string, currentRetry: number, maxRetries: number) => {
  console.log(`[DEBUG] Verification attempt ${currentRetry}/${maxRetries} for result: ${resultId}`);
};

/**
 * Get verification parameters from URL
 */
export const getVerificationUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success') === 'true';
  const sessionId = urlParams.get('session_id');
  
  return { success, sessionId };
};

/**
 * Check if the result is already marked as purchased
 */
export const checkIfAlreadyPurchased = async (resultId: string): Promise<QuizResult | null> => {
  try {
    console.log(`[DEBUG] Checking if result ${resultId} is already purchased`);
    
    const result = await fetchLatestResult(resultId);
    
    if (result && isPurchased(result)) {
      console.log('[DEBUG] Result is already marked as purchased');
      return result;
    }
    
    console.log('[DEBUG] Result is not purchased yet');
    return null;
  } catch (error) {
    console.error('[ERROR] Error checking purchase status:', error);
    return null;
  }
};

/**
 * Handle verification delay with exponential backoff
 */
export const handleVerificationDelay = async (currentRetry: number) => {
  const delay = Math.pow(2, currentRetry) * 1000;
  
  console.log(`[DEBUG] Waiting ${delay}ms before next verification attempt`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
};
