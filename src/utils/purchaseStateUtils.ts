
/**
 * Utility functions for storing and retrieving purchase data
 */

/**
 * Stores purchase-related data across browser sessions
 */
export const storePurchaseData = (resultId: string, sessionId: string, userId?: string) => {
  if (resultId) {
    console.log('Storing purchase data:', { resultId, sessionId, hasUserId: !!userId });
    localStorage.setItem('purchaseResultId', resultId);
    
    if (sessionId) {
      localStorage.setItem('stripeSessionId', sessionId);
    }
    
    // If this is a logged-in user's purchase, store that information as well
    if (userId) {
      localStorage.setItem('purchaseUserId', userId);
    }
  }
};

/**
 * Cleans up purchase-related data from browser storage
 */
export const cleanupPurchaseState = () => {
  const keysToRemove = [
    'purchaseResultId',
    'stripeSessionId',
    'purchaseTrackingId',
    'guestAccessToken',
    'guestEmail',
    'purchaseUserId'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Gets all purchase-related data from localStorage
 */
export const getPurchaseData = () => {
  return {
    resultId: localStorage.getItem('purchaseResultId'),
    sessionId: localStorage.getItem('stripeSessionId'),
    trackingId: localStorage.getItem('purchaseTrackingId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    guestEmail: localStorage.getItem('guestEmail'),
    userId: localStorage.getItem('purchaseUserId')
  };
};
