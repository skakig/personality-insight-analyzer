
/**
 * Re-exports all purchase utilities for backward compatibility
 */

export * from './helpers';
export * from './verification';
export * from './verificationCore';
export * from './verificationStrategies';
export * from './affiliateTracking';

// Export verifyPurchaseWithRetry
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5) => {
  // Import and call executeVerification
  const { executeVerification } = require('./verificationCore');
  return await executeVerification(resultId, maxRetries);
};
