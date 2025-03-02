
/**
 * Helper functions related to localStorage and data storage
 */

/**
 * Gets all stored purchase data from localStorage
 */
export const getStoredPurchaseData = () => {
  return {
    trackingId: localStorage.getItem('purchaseTrackingId'),
    stripeSessionId: localStorage.getItem('stripeSessionId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    storedResultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    guestEmail: localStorage.getItem('guestEmail'),
    checkoutUserId: localStorage.getItem('checkoutUserId')
  };
};

/**
 * Stores a session ID from URL parameters if needed
 */
export const storeSessionIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSessionId = urlParams.get('session_id');
  
  if (urlSessionId && !localStorage.getItem('stripeSessionId')) {
    localStorage.setItem('stripeSessionId', urlSessionId);
    console.log('Stored session ID from URL parameters');
    return urlSessionId;
  }
  
  return null;
};

/**
 * Gets URL parameters related to verification
 */
export const getUrlVerificationParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    urlSuccess: urlParams.get('success') === 'true',
    urlSessionId: urlParams.get('session_id')
  };
};
