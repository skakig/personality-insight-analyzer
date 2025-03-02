
/**
 * Executes the verification process for purchase status
 */
import { QuizResult } from "@/types/quiz";
import { fetchLatestResult } from "./resultFetcher";
import { isPurchased } from "@/utils/purchaseStatus";
import { getPurchaseData } from "@/utils/purchaseStateUtils";
import { updatePurchaseStatusDirectly } from "./helpers/verificationCoordinator";

/**
 * Execute verification process with retries
 */
export const executeVerification = async (resultId: string, maxRetries = 5): Promise<QuizResult | null> => {
  try {
    console.log(`[DEBUG] Starting verification execution for result: ${resultId}`);
    
    // Check if already purchased
    let result = await fetchLatestResult(resultId);
    if (result && isPurchased(result)) {
      console.log('[DEBUG] Result already marked as purchased, no verification needed');
      return result;
    }
    
    // Get purchase data from localStorage
    const { sessionId } = getPurchaseData();
    
    if (!sessionId) {
      console.log('[DEBUG] No session ID found, cannot verify purchase');
      return result;
    }
    
    // Attempt direct update as a fallback
    result = await updatePurchaseStatusDirectly(resultId, sessionId);
    
    if (result && isPurchased(result)) {
      console.log('[DEBUG] Successfully verified purchase with direct update');
      return result;
    }
    
    console.log('[DEBUG] Failed to verify purchase after all attempts');
    return null;
  } catch (error) {
    console.error('[ERROR] Error in executeVerification:', error);
    return null;
  }
};
