
import { executeVerification } from "./verificationCore";

/**
 * Verifies a purchase with retry mechanism
 * Attempts multiple times to verify if a purchase was completed
 * 
 * This is the entry point that maintains the same API as the original
 */
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5, delayMs = 1000) => {
  return executeVerification(resultId, maxRetries, delayMs);
};
