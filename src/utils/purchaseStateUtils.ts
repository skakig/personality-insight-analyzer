
/**
 * Stores purchase data in localStorage
 */
export const storePurchaseData = (resultId: string, sessionId: string, userId?: string) => {
  if (resultId) {
    localStorage.setItem('purchaseResultId', resultId);
    console.log('Stored purchase result ID:', resultId);
  }
  
  if (sessionId) {
    localStorage.setItem('stripeSessionId', sessionId);
    console.log('Stored stripe session ID:', sessionId);
  }
  
  // Store timestamp to help debugging
  localStorage.setItem('purchaseTimestamp', new Date().toISOString());
  
  // Store logged-in status
  localStorage.setItem('purchaseLoggedInState', userId ? 'logged_in' : 'guest');
  
  // Save user ID if available
  if (userId) {
    localStorage.setItem('purchaseUserId', userId);
  }
};

/**
 * Cleans up purchase state from localStorage
 */
export const cleanupPurchaseState = () => {
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('purchaseTimestamp');
  localStorage.removeItem('purchaseVerificationFailed');
  localStorage.removeItem('failedVerificationId');
  
  // Don't remove guest tokens/emails as they might be needed for other purposes
};

/**
 * Retrieves all purchase data from localStorage
 */
export const getPurchaseData = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId'),
    sessionId: localStorage.getItem('stripeSessionId'),
    trackingId: localStorage.getItem('purchaseTrackingId'),
    timestamp: localStorage.getItem('purchaseTimestamp'),
    loggedInState: localStorage.getItem('purchaseLoggedInState'),
    userId: localStorage.getItem('purchaseUserId'),
    verificationFailed: localStorage.getItem('purchaseVerificationFailed') === 'true',
    failedVerificationId: localStorage.getItem('failedVerificationId')
  };
};
