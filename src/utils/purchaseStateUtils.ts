
/**
 * Stores purchase data in localStorage for later verification
 */
export const storePurchaseData = (resultId: string | null, sessionId: string, userId?: string) => {
  if (!resultId || !sessionId) {
    console.error('Cannot store purchase data: missing resultId or sessionId');
    return;
  }
  
  console.log('Storing purchase data:', { resultId, sessionId, userId });
  
  // Store the core data needed for verification
  localStorage.setItem('stripeSessionId', sessionId);
  localStorage.setItem('checkoutResultId', resultId);
  
  // Store user ID if available (for logged in users)
  if (userId) {
    localStorage.setItem('checkoutUserId', userId);
  }
  
  // Also store timestamps
  localStorage.setItem('purchaseInitiatedAt', new Date().toISOString());
};

/**
 * Clears purchase data from localStorage after it's no longer needed
 */
export const clearPurchaseData = () => {
  localStorage.removeItem('stripeSessionId');
  localStorage.removeItem('checkoutResultId');
  localStorage.removeItem('checkoutUserId');
  localStorage.removeItem('purchaseInitiatedAt');
};

/**
 * Retrieves purchase data from localStorage
 */
export const getPurchaseData = () => {
  return {
    sessionId: localStorage.getItem('stripeSessionId'),
    resultId: localStorage.getItem('checkoutResultId'),
    userId: localStorage.getItem('checkoutUserId'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt')
  };
};
