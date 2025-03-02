import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { isPurchased } from "@/utils/purchaseStatus";
import { useVerificationFlow } from "./assessment/useVerificationFlow";
import { toast } from "./use-toast";

interface UseAssessmentResultProps {
  resultId: string | null;
  initialResult?: QuizResult | null;
  autoVerify?: boolean;
}

export const useAssessmentResult = ({
  resultId,
  initialResult = null,
  autoVerify = true
}: UseAssessmentResultProps) => {
  const [result, setResult] = useState<QuizResult | null>(initialResult);
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

  const fetchResult = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("id", id)
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
          category_scores: data.category_scores,
          answers: data.answers,
          temp_access_token: data.temp_access_token,
          temp_access_expires_at: data.temp_access_expires_at,
          guest_access_expires_at: data.guest_access_expires_at,
          purchase_date: data.purchase_date,
          purchase_amount: data.purchase_amount
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

  const verifyPurchase = useCallback(async (id: string, maxRetries = 3) => {
    try {
      const verifiedResult = await verificationFlow.verifyPurchase(id, maxRetries);
      
      if (verifiedResult) {
        setResult(verifiedResult);
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
    if (resultId) {
      fetchResult(resultId);
    }
  }, [resultId, fetchResult]);

  const handleVerification = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const success = urlParams.get('success') === 'true';
      
      if (success && sessionId) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        console.log('Running verification after Stripe success', {
          sessionId,
          userId,
          resultId: id
        });
        
        const verifiedResult = await runVerification(id, sessionId, userId);
        
        if (verifiedResult) {
          console.log('Stripe return verification successful');
          setResult(verifiedResult);
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
      
      await fetchResult(id);
      
    } catch (error) {
      console.error('Verification process error:', error);
    }
  }, [fetchResult, runVerification, isVerifying, verificationComplete, verificationSuccess]);

  useEffect(() => {
    if (resultId) {
      fetchResult(resultId);
    }
  }, [resultId, fetchResult]);

  useEffect(() => {
    if (resultId && autoVerify && result && !verified && !isVerifying) {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success') === 'true';
      
      if (success || verificationAttempts === 0) {
        handleVerification(resultId);
      }
    }
  }, [resultId, autoVerify, result, verified, isVerifying, verificationAttempts, handleVerification]);

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
    ...verificationFlow
  };
};
