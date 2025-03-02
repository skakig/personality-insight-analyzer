
// Re-export all verification strategies for backward compatibility
export { verifyWithUserId } from './strategies/userVerification';
export { verifyWithGuestToken, verifyWithGuestEmail } from './strategies/guestVerification';
export { verifyWithStripeSession } from './strategies/stripeVerification';
export { forceUpdatePurchaseStatus } from './strategies/fallbackVerification';
