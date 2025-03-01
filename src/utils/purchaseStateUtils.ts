
export const cleanupPurchaseState = () => {
  // Don't clear guest email, access token, or stripe session ID until we're sure verification is complete
  const guestEmail = localStorage.getItem('guestEmail');
  const guestAccessToken = localStorage.getItem('guestAccessToken');
  const stripeSessionId = localStorage.getItem('stripeSessionId');
  const resultId = localStorage.getItem('purchaseResultId');
  
  // Only clear tracking ID as it's no longer needed after verification
  localStorage.removeItem('purchaseTrackingId');
  
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
  
  if (resultId) {
    localStorage.setItem('purchaseResultId', resultId);
  }
};

// Add a utility to properly store purchase data before checkout
export const storePurchaseData = (resultId: string, sessionId: string, userId?: string) => {
  if (!resultId) {
    console.error('Cannot store purchase data: Missing result ID');
    return;
  }
  
  localStorage.setItem('purchaseResultId', resultId);
  
  if (sessionId) {
    localStorage.setItem('stripeSessionId', sessionId);
  }
  
  // Log what we're storing for debugging
  console.log('Storing purchase data:', {
    resultId,
    sessionId,
    timestamp: new Date().toISOString()
  });
};
