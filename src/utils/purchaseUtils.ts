
/**
 * Re-exports purchase utility functions from modular files
 */

export { isPurchased, isPending, shouldAllowAccess, shouldShowPurchaseOptions, hasAnyPurchasedReport } from './purchaseStatus';
export { executeVerification } from './purchase/verificationCore';
export { 
  checkPurchaseTracking, 
  updateResultWithPurchase, 
  manuallyCheckStripeSession 
} from './purchaseVerification';

// Add the missing function export
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5) => {
  return await executeVerification(resultId, maxRetries);
};
