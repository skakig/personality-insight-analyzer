
export const cleanupPurchaseState = () => {
  // Don't clear guest email, access token, or stripe session ID until we're sure verification is complete
  const guestEmail = localStorage.getItem('guestEmail');
  const guestAccessToken = localStorage.getItem('guestAccessToken');
  const stripeSessionId = localStorage.getItem('stripeSessionId');
  
  // Only clear tracking ID and result ID as they're no longer needed after verification
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('purchaseResultId');
  
  // Store critical values again to ensure they're not lost during cleanup
  if (guestEmail) {
    localStorage.setItem('guestEmail', guestEmail);
  }
  
  if (guestAccessToken) {
    localStorage.setItem('guestAccessToken', guestAccessToken);
  }
  
  if (stripeSessionId) {
    localStorage.setItem('stripeSessionId', stripeSessionId);
  }
};
