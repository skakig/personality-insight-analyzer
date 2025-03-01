
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
  const [maxVerificationRetries] = useState(5); // Maximum retry attempts before forcing dashboard redirect

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
          verificationAttempts,
          verificationAttempted
        });

        // First, try to access the result directly through user ID or other means
        const directResult = await checkDirectAccess(id, userId);
        if (directResult) {
          console.log('Direct access granted, skipping verification');
          setResult(directResult);
          setLoading(false);
          return;
        }

        // Determine if we should verify a purchase
        const shouldVerify = isPostPurchase || 
                            (stripeSessionId && (id || storedResultId));
        
        if (!verificationAttempted && shouldVerify) {
          console.log('Initiating purchase verification flow', {
            id,
            userId,
            stripeSessionId,
            isPostPurchase
          });
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
          
          // Maximum retries check - if we've exceeded the limit, try one last direct update
          // and then redirect to prevent infinite loading
          if (verificationAttempts >= maxVerificationRetries) {
            console.log('Maximum verification retries exceeded, attempting final direct update');
            const finalResult = await attemptDirectUpdate({
              stripeSessionId: stripeSessionId || '',
              isPostPurchase,
              verificationId,
              userId
            });
            
            if (finalResult) {
              console.log('Final direct update succeeded!');
              setResult(finalResult);
              setLoading(false);
              stopVerification();
              return;
            } else {
              console.log('Final direct update failed, redirecting to dashboard');
              // Store a flag in localStorage to show a notification on dashboard
              localStorage.setItem('purchaseVerificationFailed', 'true');
              localStorage.setItem('failedVerificationId', verificationId);
              
              toast({
                title: "Verification taking too long",
                description: "Redirecting you to the dashboard where you can access your reports.",
                variant: "default",
              });
              
              // Short delay before redirecting
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
              
              return;
            }
          }
          
          // First attempt at verifying purchase
          let success = await verifyPurchase(verificationId);
          
          // If first attempt fails and this is directly after purchase, try again
          if (!success && isPostPurchase) {
            console.log('First attempt failed, trying again after short delay');
            await new Promise(resolve => setTimeout(resolve, 1500));
            success = await verifyPurchase(verificationId);
          }
          
          // If verification failed, use fallback methods
          if (!success) {
            handleVerificationFailure(verificationAttempts);
            
            console.log('Attempting direct database update as fallback');
            const finalResult = await attemptDirectUpdate({
              stripeSessionId: stripeSessionId || '',
              isPostPurchase,
              verificationId,
              userId
            });
            
            if (finalResult) {
              console.log('Direct database update successful!');
              setResult(finalResult);
              setLoading(false);
              stopVerification();
              return;
            }
          }
        }

        // If we still don't have a result, try to fetch it directly
        if (!result && id) {
          console.log('Fetching result directly by ID');
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
