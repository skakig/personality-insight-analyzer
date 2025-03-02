
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useAssessmentCoordinator } from "./assessment/useAssessmentCoordinator";
import { useVerificationFlow } from "./assessment/useVerificationFlow";

export const useAssessmentResult = (id?: string) => {
  const [searchParams] = useSearchParams();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorHandled, setErrorHandled] = useState(false);
  const { 
    result, 
    loading, 
    setLoading, 
    setResult, 
    fetchResultById 
  } = useFetchResult();
  
  const {
    verificationAttempted,
    setVerificationAttempted,
    maxVerificationRetries,
    collectAssessmentData
  } = useAssessmentCoordinator();

  const {
    verifying,
    verificationAttempts,
    checkDirectAccess,
    showCreateAccountToast,
    executeVerificationFlow
  } = useVerificationFlow(setLoading, setResult);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        if (!id || id === ':id?') {
          setLoading(false);
          return;
        }

        // Collect all necessary data for assessment processing
        const data = await collectAssessmentData(id, searchParams);
        
        if (!data.validId) {
          setLoading(false);
          return;
        }

        const { 
          userId, 
          accessToken, 
          isPostPurchase,
          stripeSessionId,
          storedResultId 
        } = data;
        
        // Check for success parameter in URL which indicates return from Stripe
        const urlSuccess = searchParams.get('success') === 'true';
        const urlSessionId = searchParams.get('session_id');
        
        // Log key data for debugging
        console.log('Assessment loading data:', {
          id,
          userId: userId || 'guest',
          hasAccessToken: !!accessToken,
          isPostPurchase,
          urlSuccess,
          urlSessionId,
          stripeSessionId,
          storedResultId,
          timestamp: new Date().toISOString()
        });
        
        // Prioritize verification for users returning from Stripe checkout
        if ((urlSuccess || isPostPurchase) && (urlSessionId || stripeSessionId)) {
          console.log('User returning from Stripe checkout - prioritizing verification');
          setVerificationAttempted(true);
          
          try {
            const verificationResult = await executeVerificationFlow(id, {
              userId,
              stripeSessionId: urlSessionId || stripeSessionId,
              isPostPurchase: true,
              storedResultId,
              maxRetries: maxVerificationRetries
            });
            
            if (verificationResult) {
              setVerificationSuccess(true);
              return;
            }
          } catch (verificationError) {
            console.error('Post-purchase verification error:', verificationError);
            if (!errorHandled) {
              toast({
                title: "Verification Error",
                description: "We couldn't verify your purchase automatically. Please contact support if your full report isn't accessible.",
                variant: "destructive"
              });
              setErrorHandled(true);
            }
          }
        }

        // First, try to access the result directly through user ID or other means
        try {
          const directResult = await checkDirectAccess(id, userId);
          if (directResult) {
            console.log('Direct access granted, skipping verification');
            setResult(directResult);
            setLoading(false);
            return;
          }
        } catch (directAccessError) {
          console.error('Error checking direct access:', directAccessError);
        }

        // If we're returning from a purchase but don't have success=true,
        // try to verify based on stored data
        const isStripeReturn = (window.location.href.includes('/assessment/') && 
                             !window.location.href.includes('?')) && 
                             (stripeSessionId || localStorage.getItem('stripeSessionId'));
        
        if (isStripeReturn && userId) {
          console.log('Detected possible return from Stripe without success param, attempting verification');
          try {
            const verificationResult = await executeVerificationFlow(id, {
              userId,
              stripeSessionId: stripeSessionId || localStorage.getItem('stripeSessionId') || undefined,
              isPostPurchase: true,
              storedResultId,
              maxRetries: 1 // Just try once in this case
            });
            
            if (verificationResult) {
              setVerificationSuccess(true);
              return;
            }
          } catch (verificationError) {
            console.error('Stripe return verification error:', verificationError);
          }
        }

        // Determine if we should verify a purchase
        const shouldVerify = isPostPurchase || 
                          (stripeSessionId && (id || storedResultId));
        
        if (!verificationAttempted && shouldVerify) {
          setVerificationAttempted(true);
          
          // Execute the verification flow
          try {
            await executeVerificationFlow(id, {
              userId,
              stripeSessionId,
              isPostPurchase,
              storedResultId,
              maxRetries: maxVerificationRetries
            });
          } catch (verificationError) {
            console.error('Verification flow error:', verificationError);
          }
        }

        // If we still don't have a result, try to fetch it directly
        if (!result && id) {
          console.log('Fetching result directly by ID');
          try {
            const fetchedResult = await fetchResultById(id, { userId, accessToken });
            
            if (fetchedResult && !userId && fetchedResult.guest_email) {
              showCreateAccountToast(fetchedResult.guest_email);
            }
          } catch (fetchError) {
            console.error('Error fetching result by ID:', fetchError);
          }
        }
      } catch (error: any) {
        console.error('Error in assessment result:', error);
        
        // Handle specific database access errors
        if (error.message?.includes('infinite recursion') || 
            error.message?.includes('policy for relation')) {
          if (!errorHandled) {
            toast({
              title: "Database Error",
              description: "We're experiencing a database access issue. Please try again later.",
              variant: "destructive"
            });
            setErrorHandled(true);
          }
        }
        
        setLoading(false);
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
    verificationSuccess,
    refreshPage
  };
};
