
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useVerificationState } from "./assessment/useVerificationState";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
import { ToastAction } from "@/components/ui/toast";

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

  // Track if we've already attempted verification on this page load
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
        const stripeSessionId = localStorage.getItem('stripeSessionId') || searchParams.get('session_id');
        const trackingId = localStorage.getItem('purchaseTrackingId');
        const storedResultId = localStorage.getItem('purchaseResultId') || id;

        console.log('Assessment page loaded:', {
          resultId: id,
          userId: userId ? 'logged_in' : 'guest',
          hasAccessToken: !!accessToken,
          isPostPurchase,
          hasStripeSession: !!stripeSessionId,
          hasTrackingId: !!trackingId,
          storedResultId,
          verificationAttempts,
          verificationAttempted,
          timestamp: new Date().toISOString()
        });

        // Store any session ID from URL into localStorage
        if (searchParams.get('session_id') && !localStorage.getItem('stripeSessionId')) {
          localStorage.setItem('stripeSessionId', searchParams.get('session_id')!);
          console.log('Stored session ID from URL');
        }

        // Verify purchase if we just returned from Stripe or if we have tracking info
        if (!verificationAttempted && (isPostPurchase || (stripeSessionId && id === storedResultId))) {
          console.log('Initiating purchase verification flow');
          setVerificationAttempted(true);
          const success = await verifyPurchase(id);
          
          if (!success && verificationAttempts > 0) {
            toast({
              title: "Purchase verification delayed",
              description: "Your purchase may take a few moments to process. You can refresh the page or check again shortly.",
              variant: "destructive",
              action: (
                <ToastAction 
                  altText="Refresh" 
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </ToastAction>
              )
            });
          }
          
          if (!success && verificationAttempts === 0) {
            toast({
              title: "Verification in progress",
              description: "We're still processing your purchase. Please wait a moment...",
            });
            
            try {
              if (stripeSessionId) {
                await supabase
                  .from('quiz_results')
                  .update({ 
                    is_purchased: true,
                    purchase_status: 'completed',
                    purchase_completed_at: new Date().toISOString(),
                    access_method: 'purchase'
                  })
                  .eq('id', id)
                  .eq('stripe_session_id', stripeSessionId);
              }
            } catch (error) {
              console.error('Final manual update failed:', error);
            }
          }
        }

        if (!result) {
          const fetchedResult = await fetchResultById(id, { userId, accessToken });
          
          if (fetchedResult && !userId && fetchedResult.guest_email) {
            toast({
              title: "Create an Account",
              description: "Create an account to keep permanent access to your report",
              action: (
                <ToastAction 
                  altText="Sign Up" 
                  onClick={() => {
                    window.location.href = `/auth?email=${encodeURIComponent(fetchedResult.guest_email)}&action=signup`;
                  }}
                >
                  Sign Up
                </ToastAction>
              ),
              duration: 10000,
            });
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
