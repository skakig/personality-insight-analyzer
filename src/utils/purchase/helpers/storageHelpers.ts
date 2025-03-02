
/**
 * Helper functions for purchase storage
 */

/**
 * Store the session ID from URL if present
 */
export const storeSessionIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log('Storing session ID from URL:', sessionId);
    localStorage.setItem('stripeSessionId', sessionId);
    return sessionId;
  }
  
  return null;
};

/**
 * Store purchase data in localStorage
 */
export const storePurchaseData = (
  resultId: string,
  sessionId: string,
  userId?: string
) => {
  localStorage.setItem('purchaseResultId', resultId);
  localStorage.setItem('stripeSessionId', sessionId);
  localStorage.setItem('purchaseInitiatedAt', new Date().toISOString());
  
  if (userId) {
    localStorage.setItem('checkoutUserId', userId);
  }
};

/**
 * Retrieve purchase state from localStorage
 */
export const getPurchaseState = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    sessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    userId: localStorage.getItem('checkoutUserId'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt'),
    guestEmail: localStorage.getItem('guestEmail')
  };
};

/**
 * Clear purchase data from localStorage
 */
export const clearPurchaseState = () => {
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('creditsPurchaseSessionId');
  localStorage.removeItem('checkoutUserId');
  localStorage.removeItem('purchaseInitiatedAt');
};

/**
 * Get stored purchase data (for backward compatibility)
 */
export const getStoredPurchaseData = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    sessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    userId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt'),
    trackingId: localStorage.getItem('purchaseTrackingId')
  };
};
