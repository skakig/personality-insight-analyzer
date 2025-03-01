
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useFetchResult } from "./assessment/useFetchResult";
import { useAssessmentCoordinator } from "./assessment/useAssessmentCoordinator";
import { useVerificationFlow } from "./assessment/useVerificationFlow";

export const useAssessmentResult = (id?: string) => {
  const [searchParams] = useSearchParams();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
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
        
        // Prioritize verification for users returning from Stripe checkout
        if (urlSuccess && (urlSessionId || stripeSessionId)) {
          console.log('User returning from Stripe checkout - prioritizing verification');
          setVerificationAttempted(true);
          
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
        }

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
          setVerificationAttempted(true);
          
          // Execute the verification flow
          await executeVerificationFlow(id, {
            userId,
            stripeSessionId,
            isPostPurchase,
            storedResultId,
            maxRetries: maxVerificationRetries
          });
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
