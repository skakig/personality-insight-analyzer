
/**
 * Shared utilities for purchase state management
 */

/**
 * Stores purchase-related data in localStorage
 */
export const storePurchaseData = (
  resultId: string | null, 
  sessionId: string,
  userId?: string
) => {
  if (resultId) {
    localStorage.setItem('purchaseResultId', resultId);
  }
  
  if (sessionId) {
    localStorage.setItem('stripeSessionId', sessionId);
  }
  
  if (userId) {
    localStorage.setItem('purchaseUserId', userId);
  }
};

/**
 * Clears purchase-related data from localStorage
 */
export const cleanupPurchaseState = () => {
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('purchaseUserId');
  localStorage.removeItem('purchaseTrackingId');
};

/**
 * Retrieves purchase-related data from localStorage
 */
export const getPurchaseState = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId'),
    sessionId: localStorage.getItem('stripeSessionId'),
    userId: localStorage.getItem('purchaseUserId'),
    trackingId: localStorage.getItem('purchaseTrackingId')
  };
};
