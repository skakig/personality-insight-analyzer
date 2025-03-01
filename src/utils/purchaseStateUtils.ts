
export const cleanupPurchaseState = () => {
  // Clear purchase-related localStorage
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('guestAccessToken');
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('purchaseResultId');
};
