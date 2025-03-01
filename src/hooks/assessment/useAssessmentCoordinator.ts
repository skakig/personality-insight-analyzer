
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAssessmentInfo } from "@/utils/assessmentLogging";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Handles the coordination of assessment data and state initialization
 */
export const useAssessmentCoordinator = () => {
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const [maxVerificationRetries] = useState(5);

  /**
   * Collects all necessary data for assessment verification and processing
   */
  const collectAssessmentData = async (id: string | undefined, searchParams: URLSearchParams) => {
    if (!id || id === ':id?') {
      return { validId: false };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    const accessToken = searchParams.get('token') || localStorage.getItem('guestAccessToken');
    const isPostPurchase = searchParams.get('success') === 'true';
    const sessionId = searchParams.get('session_id');
    const storedSessionId = localStorage.getItem('stripeSessionId');
    const stripeSessionId = sessionId || storedSessionId;
    const trackingId = localStorage.getItem('purchaseTrackingId');
    const storedResultId = localStorage.getItem('purchaseResultId');
    
    // Store the session ID from the URL if available
    if (sessionId && !storedSessionId) {
      localStorage.setItem('stripeSessionId', sessionId);
      console.log('Stored new session ID from URL', sessionId);
    }
    
    // If this is a post-purchase redirect, save all relevant data
    if (isPostPurchase && (id || storedResultId)) {
      storePurchaseData(id || storedResultId || '', stripeSessionId || '', userId);
      console.log('Stored purchase data after redirect', {
        resultId: id || storedResultId,
        sessionId: stripeSessionId,
        userId
      });
    }

    logAssessmentInfo({
      resultId: id,
      userId,
      hasAccessToken: !!accessToken,
      isPostPurchase,
      hasStripeSession: !!stripeSessionId,
      hasTrackingId: !!trackingId,
      storedResultId,
      verificationAttempts: 0, // This will be updated by the verification hook
      verificationAttempted: verificationAttempted
    });

    return {
      validId: true,
      userId,
      accessToken,
      isPostPurchase,
      stripeSessionId,
      trackingId,
      storedResultId,
    };
  };

  return {
    verificationAttempted,
    setVerificationAttempted,
    maxVerificationRetries,
    collectAssessmentData
  };
};
