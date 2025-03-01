
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useVerificationState } from "./assessment/useVerificationState";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
import { ToastAction } from "@/components/ui/toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

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

        // Check directly if the result is already purchased
        if (id) {
          let query = supabase
            .from('quiz_results')
            .select('*')
            .eq('id', id);
          
          if (userId) {
            query = query.eq('user_id', userId);
          }
          
          const { data: directResult } = await query.maybeSingle();
          
          if (directResult && (directResult.is_purchased || directResult.is_detailed)) {
            console.log('Result already purchased, skipping verification');
            setResult(directResult);
            setLoading(false);
            return;
          }
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
            // Show appropriate message based on verification attempts
            if (verificationAttempts > 0) {
              toast({
                title: "Purchase verification delayed",
                description: "Your purchase may take a few moments to process. You can refresh the page or check your dashboard.",
                variant: "default",
                action: (
                  <ToastAction 
                    altText="Refresh" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </ToastAction>
                )
              });
            } else {
              toast({
                title: "Verification in progress",
                description: "We're still processing your purchase. Please wait a moment...",
              });
            }
            
            // Last resort direct update for post-purchase
            if (stripeSessionId && isPostPurchase && verificationId) {
              try {
                await supabase
                  .from('quiz_results')
                  .update({ 
                    is_purchased: true,
                    is_detailed: true,
                    purchase_status: 'completed',
                    purchase_completed_at: new Date().toISOString(),
                    access_method: 'purchase'
                  })
                  .eq('id', verificationId);
                  
                // Fetch the updated result once more
                const { data: finalResult } = await supabase
                  .from('quiz_results')
                  .select('*')
                  .eq('id', verificationId)
                  .maybeSingle();
                  
                if (finalResult) {
                  setResult(finalResult);
                  setLoading(false);
                  stopVerification();
                }
              } catch (error) {
                console.error('Final manual update failed:', error);
              }
            }
          }
        }

        // If we still don't have a result, fetch it
        if (!result && id) {
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
