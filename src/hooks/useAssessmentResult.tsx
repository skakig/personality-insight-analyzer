
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult, UseAssessmentResultProps } from "@/types/quiz";
import { isPurchased } from "@/utils/purchaseStatus";
import { useVerificationFlow } from "./assessment/useVerificationFlow";
import { toast } from "./use-toast";

export const useAssessmentResult = ({
  id,
  sessionId,
  email
}: UseAssessmentResultProps) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);
  
  const verificationFlow = useVerificationFlow();
  const { 
    isVerifying, 
    verificationComplete, 
    verificationSuccess,
    verificationAttempts,
    runVerification 
  } = verificationFlow;

  const fetchResult = useCallback(async (resultId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("id", resultId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const typedResult: QuizResult = {
          id: data.id,
          user_id: data.user_id,
          personality_type: data.personality_type,
          is_purchased: data.is_purchased || false,
          is_detailed: data.is_detailed || false,
          purchase_status: data.purchase_status as 'pending' | 'completed' | null,
          access_method: data.access_method as 'purchase' | 'free' | 'credit' | 'subscription' | 'forced_update' | null,
          stripe_session_id: data.stripe_session_id,
          guest_email: data.guest_email,
          guest_access_token: data.guest_access_token,
          purchase_initiated_at: data.purchase_initiated_at,
          purchase_completed_at: data.purchase_completed_at,
          created_at: data.created_at,
          updated_at: data.updated_at || data.created_at,
          detailed_analysis: data.detailed_analysis,
          category_scores: data.category_scores as Record<string, number> | null,
          answers: data.answers,
          temp_access_token: data.temp_access_token,
          temp_access_expires_at: data.temp_access_expires_at,
          guest_access_expires_at: data.guest_access_expires_at,
          purchase_date: data.purchase_date,
          purchase_amount: data.purchase_amount,
          primary_level: data.primary_level
        };

        setResult(typedResult);
        
        if (isPurchased(typedResult)) {
          setVerified(true);
        }
      } else {
        setError("Result not found");
      }
    } catch (err: any) {
      console.error("Error fetching result:", err);
      setError(err.message || "Failed to load assessment result");
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPurchase = useCallback(async (resultId: string, maxRetries = 3) => {
    try {
      const verifiedResult = await verificationFlow.runVerification(resultId);
      
      if (verifiedResult) {
        setResult(verifiedResult as QuizResult);
        setVerified(true);
        return verifiedResult;
      }
      
      return null;
    } catch (error) {
      console.error("Verification error:", error);
      return null;
    }
  }, [verificationFlow]);

  const refreshPage = useCallback(() => {
    if (id) {
      fetchResult(id);
    }
  }, [id, fetchResult]);

  const handleVerification = useCallback(async (resultId: string) => {
    if (!resultId) return;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const stripeSessionId = urlParams.get('session_id');
      const success = urlParams.get('success') === 'true';
      
      if (success && stripeSessionId) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        console.log('Running verification after Stripe success', {
          sessionId: stripeSessionId,
          userId,
          resultId
        });
        
        const verifiedResult = await runVerification(resultId, stripeSessionId, userId);
        
        if (verifiedResult) {
          console.log('Stripe return verification successful');
          setResult(verifiedResult as QuizResult);
          setVerified(true);
          toast({
            title: "Purchase verified",
            description: "Your purchase has been verified successfully."
          });
          return;
        }
      }
      
      if (isVerifying) {
        console.log('Verification already in progress');
        return;
      }
      
      if (verificationComplete) {
        if (verificationSuccess) {
          console.log('Verification already completed successfully');
          setVerified(true);
        } else {
          console.log('Verification already completed with failure');
        }
        return;
      }
      
      await fetchResult(resultId);
      
    } catch (error) {
      console.error('Verification process error:', error);
    }
  }, [fetchResult, runVerification, isVerifying, verificationComplete, verificationSuccess]);

  useEffect(() => {
    if (id) {
      fetchResult(id);
    }
  }, [id, fetchResult]);

  useEffect(() => {
    if (id && result && !verified && !isVerifying) {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success') === 'true';
      
      if (success || verificationAttempts === 0) {
        handleVerification(id);
      }
    }
  }, [id, result, verified, isVerifying, verificationAttempts, handleVerification]);

  return {
    result,
    loading,
    error,
    verifyPurchase,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    verificationAttempts,
    verified,
    refreshPage,
    runVerification: verificationFlow.runVerification
  };
};
