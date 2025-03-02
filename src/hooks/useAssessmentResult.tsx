
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuizResult, UseAssessmentResultProps } from '@/types/quiz';
import { executeVerification } from '@/utils/purchase';
import { isPurchased, shouldAllowAccess } from '@/utils/purchaseStatus';

export const useAssessmentResult = ({ id, sessionId, email }: UseAssessmentResultProps) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempted, setVerificationAttempted] = useState<boolean>(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'none' | 'pending' | 'complete'>('none');

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      setLoading(true);
      try {
        console.log('Fetching assessment result:', id);

        const { data, error: fetchError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching result:', fetchError);
          setError('Failed to load assessment result');
          return;
        }

        if (!data) {
          console.log('No result found with ID:', id);
          setError('Assessment not found');
          return;
        }

        // Convert the raw data to a properly typed QuizResult
        const typedResult: QuizResult = {
          id: data.id,
          user_id: data.user_id,
          personality_type: data.personality_type,
          is_purchased: data.is_purchased || false,
          is_detailed: data.is_detailed || false,
          purchase_status: data.purchase_status,
          access_method: data.access_method,
          stripe_session_id: data.stripe_session_id,
          guest_email: data.guest_email,
          guest_access_token: data.guest_access_token,
          purchase_initiated_at: data.purchase_initiated_at,
          purchase_completed_at: data.purchase_completed_at,
          created_at: data.created_at,
          updated_at: data.updated_at || data.created_at,
          detailed_analysis: data.detailed_analysis,
          category_scores: data.category_scores,
          answers: data.answers,
          temp_access_token: data.temp_access_token,
          temp_access_expires_at: data.temp_access_expires_at,
          guest_access_expires_at: data.guest_access_expires_at,
          purchase_date: data.purchase_date,
          purchase_amount: data.purchase_amount,
          primary_level: data.primary_level
        };

        setResult(typedResult);
        
        // Determine purchase status
        if (isPurchased(typedResult)) {
          setPurchaseStatus('complete');
        } else if (typedResult.purchase_status === 'pending') {
          setPurchaseStatus('pending');
        } else {
          setPurchaseStatus('none');
        }
      } catch (err: any) {
        console.error('Error in useAssessmentResult:', err);
        setError('An error occurred while loading the assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  // Verify purchase status when component mounts
  useEffect(() => {
    if (!result || verificationAttempted) return;

    const verifyPurchase = async () => {
      if (shouldAllowAccess(result)) {
        console.log('Assessment already purchased, skipping verification');
        return;
      }

      console.log('Verifying purchase for result:', result.id);
      setVerificationAttempted(true);

      try {
        const verifiedResult = await executeVerification(result.id);
        
        if (verifiedResult && isPurchased(verifiedResult)) {
          console.log('Purchase verified successfully');
          setResult(verifiedResult as QuizResult);
          setPurchaseStatus('complete');
          
          toast({
            title: "Purchase Verified",
            description: "Your report is now available for viewing",
          });
        } else {
          console.log('Purchase verification failed or not needed');
        }
      } catch (err) {
        console.error('Error verifying purchase:', err);
      }
    };

    verifyPurchase();
  }, [result, verificationAttempted]);

  return {
    result,
    loading,
    error,
    purchaseStatus,
    allowAccess: result ? shouldAllowAccess(result) : false,
  };
};
