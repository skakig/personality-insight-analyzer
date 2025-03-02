
/**
 * Coordinator for verification processes
 */
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { fetchLatestResult } from "../resultFetcher";

/**
 * Get URL parameters relevant to verification
 */
export const getVerificationUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    success: urlParams.get('success'),
    sessionId: urlParams.get('session_id')
  };
};

/**
 * Log verification parameters for debugging
 */
export const logVerificationAttempt = (
  resultId: string, 
  attemptNumber: number, 
  maxRetries: number, 
  additionalData?: Record<string, any>
) => {
  console.log(`[DEBUG] Attempting verification for result ${resultId} (attempt ${attemptNumber}/${maxRetries})`, additionalData || {});
};

/**
 * Check if result is already purchased to avoid unnecessary verification
 */
export const checkIfAlreadyPurchased = async (resultId: string): Promise<QuizResult | null> => {
  if (!resultId) return null;
  
  const currentResult = await fetchLatestResult(resultId);
  if (currentResult?.is_purchased) {
    console.log('[DEBUG] Result already marked as purchased, skipping verification');
    return currentResult;
  }
  
  return null;
};

/**
 * Handle delay between verification attempts with exponential backoff
 */
export const handleVerificationDelay = async (currentRetry: number): Promise<void> => {
  const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
  console.log(`[DEBUG] No verification methods succeeded, retrying in ${delay}ms`);
  await new Promise(resolve => setTimeout(resolve, delay));
};
