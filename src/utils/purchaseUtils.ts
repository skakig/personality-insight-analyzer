
/**
 * Re-exports purchase utility functions from modular files
 */

export { isPurchased, isPending, shouldAllowAccess, shouldShowPurchaseOptions, hasAnyPurchasedReport } from './purchaseStatus';
export { 
  checkPurchaseTracking, 
  updateResultWithPurchase, 
  manuallyCheckStripeSession 
} from './purchaseVerification';

// Add the missing function export
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5) => {
  // Import dynamically to avoid circular dependencies
  const { executeVerification } = await import('./purchase/verificationCore');
  return await executeVerification(resultId, maxRetries);
};
