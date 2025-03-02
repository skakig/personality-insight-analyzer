
/**
 * Utility functions for managing purchase state
 */

/**
 * Store purchase data in localStorage
 */
export const storePurchaseData = (
  resultId: string,
  sessionId: string,
  userId?: string
) => {
  console.log('Storing purchase data:', { resultId, sessionId, userId });
  
  localStorage.setItem('purchaseResultId', resultId);
  localStorage.setItem('stripeSessionId', sessionId);
  localStorage.setItem('purchaseInitiatedAt', new Date().toISOString());
  
  if (userId) {
    localStorage.setItem('checkoutUserId', userId);
  }
};

/**
 * Clear purchase data from localStorage
 */
export const clearPurchaseData = () => {
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('creditsPurchaseSessionId');
  localStorage.removeItem('checkoutUserId');
  localStorage.removeItem('purchaseInitiatedAt');
  localStorage.removeItem('purchaseTrackingId');
};

/**
 * Get purchase data from localStorage
 */
export const getPurchaseData = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    sessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    userId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt'),
    trackingId: localStorage.getItem('purchaseTrackingId')
  };
};

/**
 * Alias for clearPurchaseData for compatibility
 */
export const cleanupPurchaseState = clearPurchaseData;

/**
 * Alias for getPurchaseData for compatibility
 */
export const getPurchaseState = getPurchaseData;

/**
 * Get stored purchase data (extended)
 */
export const getStoredPurchaseData = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId') || localStorage.getItem('guestQuizResultId'),
    sessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    userId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt'),
    trackingId: localStorage.getItem('purchaseTrackingId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    checkoutResultId: localStorage.getItem('checkoutResultId'),
    checkoutUserId: localStorage.getItem('checkoutUserId'),
    stripeSessionId: localStorage.getItem('stripeSessionId'),
    guestQuizResultId: localStorage.getItem('guestQuizResultId')
  };
};
