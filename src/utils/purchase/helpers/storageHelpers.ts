
/**
 * Helper functions related to localStorage operations
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

export const clearPurchaseData = () => {
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('guestAccessToken');
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('guestEmail'); 
  localStorage.removeItem('checkoutUserId');
};

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

