
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
 * Clears all purchase-related data from localStorage
 */
export const clearPurchaseData = () => {
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('guestAccessToken');
  localStorage.removeItem('purchaseResultId');
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('guestEmail'); 
  localStorage.removeItem('checkoutUserId');
};
