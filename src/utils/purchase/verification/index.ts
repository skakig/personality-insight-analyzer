
/**
 * Central export point for verification functionality
 */

// Re-export strategies
export { 
  verifyWithUserId,
  verifyWithGuestToken, 
  verifyWithGuestEmail,
  verifyWithStripeSession,
  forceUpdatePurchaseStatus
} from './strategies';

// Export verification executor
export { executeVerification } from './verificationExecutor';

// Export result fetcher
export { fetchLatestResult } from './resultFetcher';
