
/**
 * Helper functions for purchase verification
 */
export const getUrlVerificationParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    urlSuccess: urlParams.get('success') === 'true',
    urlSessionId: urlParams.get('session_id')
  };
};

export const logVerificationParameters = (params: {
  resultId: string;
  userId?: string | null;
  trackingId?: string | null;
  sessionId?: string | null;
  guestToken?: string | null;
  guestEmail?: string | null;
  urlSuccess?: boolean;
  maxRetries: number;
  delayMs: number;
}) => {
  console.log('Verification parameters:', params);
};
