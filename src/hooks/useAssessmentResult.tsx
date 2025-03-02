
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { isPurchased } from "@/utils/purchaseStatus";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { executeVerification } from "@/utils/purchase";

export interface UseAssessmentResultProps {
  id?: string;
  sessionId?: string;
  email?: string;
}

export const useAssessmentResult = ({ id, sessionId, email }: UseAssessmentResultProps) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [purchaseStatus, setPurchaseStatus] = useState<"none" | "pending" | "complete">("none");
  const [allowAccess, setAllowAccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) {
        setError("No assessment ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Fetch the result
        const { data, error: fetchError } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          throw new Error(`Error fetching result: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error("Assessment not found");
        }

        // Store session ID if provided for verification purposes
        if (sessionId) {
          storePurchaseData(id, sessionId);
        }

        // Convert to our QuizResult type with proper types
        const typedResult: QuizResult = {
          id: data.id,
          user_id: data.user_id,
          personality_type: data.personality_type,
          is_purchased: !!data.is_purchased,
          is_detailed: !!data.is_detailed, 
          purchase_status: data.purchase_status as string,
          access_method: data.access_method as string,
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
        
        // Determine purchase status
        if (isPurchased(typedResult)) {
          setPurchaseStatus("complete");
          setAllowAccess(true);
        } else if (typedResult.purchase_status === "pending") {
          setPurchaseStatus("pending");
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Error in useAssessmentResult:", error);
        setError(error.message || "Failed to load assessment");
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, sessionId, email]);

  return {
    result: result as QuizResult,
    loading,
    error,
    purchaseStatus,
    allowAccess
  };
};

export default useAssessmentResult;
