
/**
 * Logs assessment information for debugging
 */
export const logAssessmentInfo = (params: {
  resultId?: string;
  userId?: string;
  hasAccessToken: boolean;
  isPostPurchase: boolean;
  hasStripeSession: boolean;
  hasTrackingId: boolean;
  storedResultId?: string | null;
  verificationAttempts: number;
  verificationAttempted: boolean;
}) => {
  console.log('Assessment page loaded:', {
    resultId: params.resultId,
    userId: params.userId ? 'logged_in' : 'guest',
    hasAccessToken: params.hasAccessToken,
    isPostPurchase: params.isPostPurchase,
    hasStripeSession: params.hasStripeSession,
    hasTrackingId: params.hasTrackingId,
    storedResultId: params.storedResultId,
    verificationAttempts: params.verificationAttempts,
    verificationAttempted: params.verificationAttempted,
    timestamp: new Date().toISOString()
  });
};
