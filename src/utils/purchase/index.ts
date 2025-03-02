
/**
 * Re-export purchase utilities for easier imports
 */

export * from './helpers';
export * from './verification';
export * from './affiliateTracking';
export { executeVerification } from './verificationCore';

// Add export for the verifyPurchaseWithRetry function
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5) => {
  return await executeVerification(resultId, maxRetries);
};
