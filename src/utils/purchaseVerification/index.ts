
/**
 * Entry point for purchase verification utilities
 * Re-exports all verification functions for backward compatibility
 */
import { manuallyVerifyWithSessionId, manuallyCheckStripeSession } from './stripeVerification';
import { checkPurchaseTracking, updateResultWithPurchase } from './trackingVerification';
import { verifyResultWithSessionId, fetchResultBySessionId, findAnyResultBySessionId } from './resultVerification';
import { updateResultWithSessionId, createUpdateQuery } from './databaseUpdates';
import { findAndUpdateTrackingRecord } from './trackingHelpers';

export {
  checkPurchaseTracking,
  updateResultWithPurchase,
  manuallyVerifyWithSessionId,
  manuallyCheckStripeSession,
  verifyResultWithSessionId,
  fetchResultBySessionId,
  findAnyResultBySessionId,
  updateResultWithSessionId,
  createUpdateQuery,
  findAndUpdateTrackingRecord
};
