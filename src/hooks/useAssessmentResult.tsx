
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
import { QuizResult } from "@/types/quiz"; // Updated import
import { toast } from "./use-toast";
import { useAuth } from "./useAuth";

export const useAssessmentResult = (id?: string) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { session } = useAuth(); // Updated to use session instead of user

  const {
    loading: verifying,
    verified: verificationComplete,
    error: verificationError,
    verifyPurchase
  } = useVerifyPurchase();

  // Derived state for UI components
  const verificationSuccess = verificationComplete && !verificationError;
  const verificationAttempts = 0; // This can be managed in state if needed

  // Load the assessment result
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No assessment ID provided");
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError("Assessment not found");
          return;
        }

        setResult(data);
        
        // If result indicates purchase in progress, verify it
        if (data.purchase_status === 'pending' || data.stripe_session_id) {
          await verifyResult();
        }
      } catch (err: any) {
        console.error("Error fetching assessment:", err);
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  // Verification functions
  const verifyResult = useCallback(() => {
    if (!id) return null;
    return verifyPurchase(id);
  }, [id, verifyPurchase]);
  
  const checkDirectAccess = async () => {
    // Implementation can be added if needed
    return false;
  };

  const showCreateAccountToast = () => {
    toast({
      title: "Create an account",
      description: "Sign up to save your results and access them anytime.",
    });
  };

  const executeVerificationFlow = async () => {
    return verifyResult();
  };

  const runFallbackVerification = async () => {
    // Implementation can be added if needed
    return false;
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return {
    result,
    loading,
    error,
    verifying,
    verificationAttempts,
    verificationComplete,
    verificationSuccess,
    checkDirectAccess,
    showCreateAccountToast,
    executeVerificationFlow,
    verifyResult,
    runFallbackVerification,
    refreshPage
  };
};
