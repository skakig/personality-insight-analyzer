import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { isPurchased } from "@/utils/purchaseStatus";
import { useVerificationFlow } from "./assessment/useVerificationFlow";

interface Json {
  [key: string]: any;
}

export const useAssessmentResult = (resultId: string | null) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const verificationFlow = useVerificationFlow();

  useEffect(() => {
    if (resultId) {
      fetchResult(resultId);
    }
  }, [resultId]);

  const verifyPurchase = async (id: string, maxRetries: number = 3) => {
    setLoading(true);
    setError("");
    try {
      // Await the verification process
      const verifiedResult = await verificationFlow.runVerification(id);
      
      if (verifiedResult) {
        setResult(verifiedResult);
      } else {
        console.error("Purchase verification failed after multiple retries.");
        setError("Purchase verification failed. Please contact support.");
      }
    } catch (err: any) {
      console.error("Error during purchase verification:", err);
      setError(err.message || "Failed to verify purchase");
    } finally {
      setLoading(false);
    }
  };

  // In the fetching result part, fix the updated_at issue
  const fetchResult = async (resultId: string) => {
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Ensure all required properties exist with proper types
        const processedResult: QuizResult = {
          id: data.id,
          user_id: data.user_id || null,
          personality_type: data.personality_type,
          is_purchased: !!data.is_purchased,
          is_detailed: !!data.is_detailed, 
          purchase_status: data.purchase_status || null,
          access_method: data.access_method || null,
          stripe_session_id: data.stripe_session_id || null,
          guest_email: data.guest_email || null,
          guest_access_token: data.guest_access_token || null,
          purchase_initiated_at: data.purchase_initiated_at || null,
          purchase_completed_at: data.purchase_completed_at || null,
          created_at: data.created_at,
          updated_at: data.updated_at || null,
          detailed_analysis: data.detailed_analysis || null,
          category_scores: data.category_scores ? 
            typeof data.category_scores === 'object' ? 
              data.category_scores : 
              JSON.parse(data.category_scores) : 
            null,
          answers: data.answers || null,
          temp_access_token: data.temp_access_token || null,
          temp_access_expires_at: data.temp_access_expires_at || null,
          guest_access_expires_at: data.guest_access_expires_at || null,
          purchase_date: data.purchase_date || null,
          purchase_amount: data.purchase_amount || null
        };
        
        setResult(processedResult);
        return processedResult;
      } else {
        setResult(null);
        setError("Assessment not found");
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching assessment result:", err);
      setError(err.message || "Failed to load assessment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add missing properties for compatibility
  const refreshPage = () => {
    window.location.reload();
  };

  const verifying = verificationFlow.isVerifying;

  return {
    result,
    loading,
    error,
    verifyPurchase,
    runVerification: verificationFlow.runVerification,
    isVerifying: verificationFlow.isVerifying,
    verificationComplete: verificationFlow.verificationComplete,
    verificationSuccess: verificationFlow.verificationSuccess,
    verificationAttempts: verificationFlow.verificationAttempts || 0,
    verified: isPurchased(result), 
    refreshPage,
    verifying // For backward compatibility
  };
};
