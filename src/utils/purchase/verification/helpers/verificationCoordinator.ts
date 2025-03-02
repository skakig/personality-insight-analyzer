
/**
 * Helper functions for coordinating the verification process
 */
import { QuizResult } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { fetchLatestResult } from "../resultFetcher";
import { getPurchaseData, storePurchaseData } from "@/utils/purchaseStateUtils";

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
  
  // If there's a session ID in the URL, store it for verification process
  if (sessionId) {
    const purchaseData = getPurchaseData();
    if (purchaseData.resultId) {
      console.log(`[DEBUG] Storing session ID from URL: ${sessionId} for result: ${purchaseData.resultId}`);
      storePurchaseData(purchaseData.resultId, sessionId, purchaseData.userId);
    }
  }
  
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

/**
 * Direct database update for purchase status
 * Used as a fallback when other verification methods fail
 */
export const updatePurchaseStatusDirectly = async (resultId: string, sessionId: string) => {
  if (!resultId || !sessionId) {
    console.error('[ERROR] Missing resultId or sessionId for direct update');
    return null;
  }

  try {
    console.log(`[DEBUG] Attempting direct purchase status update for result: ${resultId}, session: ${sessionId}`);
    
    const { data: result, error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: sessionId
      })
      .eq('id', resultId)
      .select()
      .single();
      
    if (error) {
      console.error('[ERROR] Failed to update purchase status directly:', error);
      return null;
    }
    
    console.log('[DEBUG] Successfully updated purchase status directly:', result);
    return result;
  } catch (error) {
    console.error('[ERROR] Exception during direct purchase update:', error);
    return null;
  }
};
