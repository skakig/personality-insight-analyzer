
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useVerificationState } from "./assessment/useVerificationState";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
import { ToastAction } from "@/components/ui/toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { usePreVerificationChecks } from "./assessment/usePreVerificationChecks";
import { usePostPurchaseHandler } from "./assessment/usePostPurchaseHandler";
import { logAssessmentInfo } from "@/utils/assessmentLogging";

export const useAssessmentResult = (id?: string) => {
  const [searchParams] = useSearchParams();
  const { 
    result, 
    loading, 
    setLoading, 
    setResult, 
    fetchResultById 
  } = useFetchResult();
  
  const {
    verifying,
    verificationAttempts,
    startVerification,
    stopVerification,
    incrementAttempts
  } = useVerificationState();
  
  const { verifyPurchase } = useVerifyPurchase(
    setLoading, 
    setResult, 
    { startVerification, stopVerification, incrementAttempts }
  );

  const { checkDirectAccess, showCreateAccountToast } = usePreVerificationChecks();
  const { handleVerificationFailure, attemptDirectUpdate } = usePostPurchaseHandler();

  // Track if we've already attempted verification on this page load
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        // If no ID or ID is a placeholder, exit early
        if (!id || id === ':id?') {
          setLoading(false);
          return;
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
        
        // If we have a session ID from the URL, make sure to store it
        if (sessionId && !storedSessionId) {
          localStorage.setItem('stripeSessionId', sessionId);
        }
        
        // If we're returning from a successful purchase and have a result ID to verify
        if (isPostPurchase && (id || storedResultId)) {
          // Store the result ID and session ID
          storePurchaseData(id || storedResultId || '', stripeSessionId || '');
        }

        // Log information for debugging
        logAssessmentInfo({
          resultId: id,
          userId,
          hasAccessToken: !!accessToken,
          isPostPurchase,
          hasStripeSession: !!stripeSessionId,
          hasTrackingId: !!trackingId,
          storedResultId,
          verificationAttempts,
          verificationAttempted
        });

        // Check if direct access is possible (already purchased)
        const directResult = await checkDirectAccess(id, userId);
        if (directResult) {
          setResult(directResult);
          setLoading(false);
          return;
        }

        // Verify purchase if we just returned from Stripe or have necessary info
        const shouldVerify = isPostPurchase || 
                            (stripeSessionId && (id || storedResultId));
        
        if (!verificationAttempted && shouldVerify) {
          console.log('Initiating purchase verification flow');
          setVerificationAttempted(true);
          
          // Determine which ID to use for verification
          const verificationId = id || storedResultId;
          
          if (!verificationId) {
            console.error('No result ID available for verification');
            toast({
              title: "Verification Error",
              description: "Missing result ID. Please try accessing your report from the dashboard.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          // Try to verify the purchase
          let success = await verifyPurchase(verificationId);
          
          // If first attempt fails and we just came back from Stripe, try again
          if (!success && isPostPurchase) {
            console.log('First attempt failed, trying again after short delay');
            await new Promise(resolve => setTimeout(resolve, 1500));
            success = await verifyPurchase(verificationId);
          }
          
          if (!success) {
            // Handle verification failure
            handleVerificationFailure(verificationAttempts);
            
            // Last resort direct update for post-purchase
            const finalResult = await attemptDirectUpdate({
              stripeSessionId,
              isPostPurchase,
              verificationId
            });
            
            if (finalResult) {
              setResult(finalResult);
              setLoading(false);
              stopVerification();
            }
          }
        }

        // If we still don't have a result, fetch it
        if (!result && id) {
          const fetchedResult = await fetchResultById(id, { userId, accessToken });
          
          if (fetchedResult && !userId && fetchedResult.guest_email) {
            showCreateAccountToast(fetchedResult.guest_email);
          }
        }
      } catch (error: any) {
        console.error('Error in assessment result:', error);
        setLoading(false);
        stopVerification();
      }
    };

    loadAssessment();
  }, [id, searchParams, verificationAttempts]);

  const refreshPage = () => window.location.reload();

  return {
    result,
    loading,
    verifying,
    verificationAttempts,
    refreshPage
  };
};
