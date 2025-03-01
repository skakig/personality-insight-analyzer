
export const cleanupPurchaseState = () => {
  // Don't clear guest email as we might need it for verification
  const guestEmail = localStorage.getItem('guestEmail');
  
  // Clear purchase-related localStorage
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('purchaseTrackingId');
  localStorage.removeItem('purchaseResultId');
  
  // Don't clear guestAccessToken if we don't have guestEmail
  if (guestEmail) {
    // We can safely clear this as we have the email for verification
    localStorage.removeItem('guestAccessToken');
  }
};
