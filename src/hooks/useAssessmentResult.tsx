import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useVerificationState } from "./assessment/useVerificationState";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
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

  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
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
        
        if (sessionId && !storedSessionId) {
          localStorage.setItem('stripeSessionId', sessionId);
        }
        
        if (isPostPurchase && (id || storedResultId)) {
          storePurchaseData(id || storedResultId || '', stripeSessionId || '', userId);
        }

        logAssessmentInfo({
          resultId: id,
          userId,
          hasAccessToken: !!accessToken,
          isPostPurchase,
          hasStripeSession: !!stripeSessionId,
          hasTrackingId: !!trackingId,
          storedResultId,
          verificationAttempts,
          verificationAttempted,
          isLoggedIn: !!userId
        });

        const directResult = await checkDirectAccess(id, userId);
        if (directResult) {
          setResult(directResult);
          setLoading(false);
          return;
        }

        const shouldVerify = isPostPurchase || 
                            (stripeSessionId && (id || storedResultId));
        
        if (!verificationAttempted && shouldVerify) {
          console.log('Initiating purchase verification flow');
          setVerificationAttempted(true);
          
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
          
          let success = await verifyPurchase(verificationId);
          
          if (!success && isPostPurchase) {
            console.log('First attempt failed, trying again after short delay');
            await new Promise(resolve => setTimeout(resolve, 1500));
            success = await verifyPurchase(verificationId);
          }
          
          if (!success) {
            handleVerificationFailure(verificationAttempts);
            
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
