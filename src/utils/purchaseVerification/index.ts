
/**
 * Entry point for purchase verification utilities
 * Re-exports all verification functions for backward compatibility
 */
import { checkPurchaseTracking, updateResultWithPurchase } from './trackingVerification';
import { manuallyVerifyWithSessionId, manuallyCheckStripeSession } from './stripeVerification';

export {
  checkPurchaseTracking,
  updateResultWithPurchase,
  manuallyVerifyWithSessionId,
  manuallyCheckStripeSession
};
