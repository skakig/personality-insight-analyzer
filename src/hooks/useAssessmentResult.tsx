
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVerifyPurchase } from "./assessment/useVerifyPurchase";
import { QuizResult } from "@/types/quiz"; 
import { toast } from "./use-toast";
import { useAuth } from "./useAuth";

export const useAssessmentResult = (id?: string) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { session } = useAuth(); // Using session instead of user

  const {
    isVerifying, // Using the renamed property
    verificationComplete,
    verificationSuccess,
    runVerification
  } = useVerifyPurchase();

  // Derived state for UI components
  const verifying = isVerifying; // Alias for backward compatibility
  const verificationAttempts = 0; // Adding this for backward compatibility

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

        // Safely cast the data to QuizResult to ensure type compatibility
        const typedResult: QuizResult = {
          ...data,
          purchase_status: data.purchase_status as 'pending' | 'completed' | null,
          access_method: data.access_method as 'purchase' | 'free' | 'credit' | 'subscription' | 'forced_update' | null
        };

        setResult(typedResult);
        
        // If result indicates purchase in progress, verify it
        if (typedResult.purchase_status === 'pending' || typedResult.stripe_session_id) {
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
    return runVerification(id);
  }, [id, runVerification]);
  
  // Adding these methods for backward compatibility
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
    runFallbackVerification: async () => false, // Stub implementation for compatibility
    refreshPage
  };
};
