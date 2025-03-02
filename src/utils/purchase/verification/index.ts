
/**
 * Export verification strategies with handling for duplicates
 */

// Export strategies
export { 
  verifyWithUserId,
  verifyWithGuestToken,
  verifyWithGuestEmail,
  verifyWithStripeSession
} from './strategies';

// Export base strategy utilities
export {
  verifyWithUserId as userVerification,
  verifyWithGuestToken as guestTokenVerification,
  verifyWithGuestEmail as guestEmailVerification,
  verifyWithStripeSession as stripeVerification,
  forceUpdatePurchaseStatus
} from './baseStrategies';
