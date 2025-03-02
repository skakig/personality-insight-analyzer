
/**
 * Entry point for verification strategies
 * Re-exports all verification functionality for external use
 */

// Core strategies
export { 
  executeImmediateVerificationStrategies,
  executeRetryVerificationStrategies,
  executeFallbackVerification
} from './coreStrategies';

// Individual verification methods
export { 
  verifyWithUserId,
  verifyWithGuestToken,
  verifyWithGuestEmail,
  verifyWithStripeSession,
  forceUpdatePurchaseStatus
} from './baseStrategies';

// Utilities
export * from './verificationUtils';
