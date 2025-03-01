
/**
 * Store purchase data in localStorage
 */
export const storePurchaseData = (resultId: string, sessionId: string, userId?: string) => {
  // Store for verification after redirect
  localStorage.setItem('checkoutResultId', resultId);
  localStorage.setItem('stripeSessionId', sessionId);
  
  // Store user ID if available
  if (userId) {
    localStorage.setItem('checkoutUserId', userId);
  }
  
  // Store timestamp
  localStorage.setItem('checkoutTimestamp', Date.now().toString());
};

/**
 * Retrieve purchase data from localStorage
 */
export const getPurchaseState = () => {
  return {
    resultId: localStorage.getItem('checkoutResultId'),
    sessionId: localStorage.getItem('stripeSessionId'),
    userId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    timestamp: localStorage.getItem('checkoutTimestamp')
  };
};

/**
 * Clean up purchase state data from localStorage
 */
export const cleanupPurchaseState = () => {
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('checkoutUserId');
  localStorage.removeItem('checkoutTimestamp');
  // Don't remove guestEmail or guestAccessToken since they may be needed later
};
