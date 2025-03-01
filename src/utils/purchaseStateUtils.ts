
export const cleanupPurchaseState = () => {
  // Don't clear guest email or access token as we might need them for verification
  const guestEmail = localStorage.getItem('guestEmail');
  const guestAccessToken = localStorage.getItem('guestAccessToken');
  
  // Clear purchase-related localStorage
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('purchaseResultId');
  
  // Store these critical values again to ensure they're not lost
  if (guestEmail) {
    localStorage.setItem('guestEmail', guestEmail);
  }
  
  if (guestAccessToken) {
    localStorage.setItem('guestAccessToken', guestAccessToken);
  }
};
