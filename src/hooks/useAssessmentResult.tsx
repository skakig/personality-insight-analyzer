
import { useState, useEffect } from "react";
import { QuizResult, UseAssessmentResultProps } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { isPurchased, isPending, shouldAllowAccess, verifyPurchaseWithRetry } from "@/utils/purchaseUtils";

export const useAssessmentResult = ({ id, sessionId, email }: UseAssessmentResultProps) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [purchaseStatus, setPurchaseStatus] = useState<"pending" | "complete" | "none">("none");
  const [allowAccess, setAllowAccess] = useState(false);
  
  // Additional verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  useEffect(() => {
    if (!id && !sessionId && !email) {
      setError("No assessment ID, session ID, or email provided");
      setLoading(false);
      return;
    }
    
    fetchResult();
  }, [id, sessionId, email]);
  
  const fetchResult = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('quiz_results').select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else if (sessionId) {
        query = query.eq('stripe_session_id', sessionId);
      } else if (email) {
        query = query.eq('guest_email', email);
      }
      
      const { data, error: fetchError } = await query.maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching result:', fetchError);
        setError("Failed to load assessment result. Please try again.");
        setLoading(false);
        return;
      }
      
      if (!data) {
        setError("Assessment not found. It may have been deleted or the link is incorrect.");
        setLoading(false);
        return;
      }
      
      // Create a properly typed result object
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
        updated_at: data.updated_at || data.created_at, // Set default if missing
        detailed_analysis: data.detailed_analysis,
        // Ensure category_scores is correctly typed
        category_scores: data.category_scores 
          ? (typeof data.category_scores === 'string' 
            ? JSON.parse(data.category_scores) 
            : data.category_scores) as Record<string, number>
          : null,
        answers: data.answers,
        temp_access_token: data.temp_access_token,
        temp_access_expires_at: data.temp_access_expires_at,
        guest_access_expires_at: data.guest_access_expires_at,
        purchase_date: data.purchase_date,
        purchase_amount: data.purchase_amount,
        primary_level: data.primary_level || null, // Set default if missing
        conversions: data.conversions
      };
      
      setResult(typedResult);
      
      // Determine purchase status
      if (isPurchased(typedResult)) {
        setPurchaseStatus("complete");
      } else if (isPending(typedResult)) {
        setPurchaseStatus("pending");
      } else {
        setPurchaseStatus("none");
      }
      
      // Determine access permissions
      setAllowAccess(shouldAllowAccess(typedResult));
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error in fetchResult:', err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };
  
  const refreshPage = () => {
    fetchResult();
  };
  
  const runVerification = async () => {
    if (!result || !result.id) return;
    
    try {
      setIsVerifying(true);
      setVerificationAttempts(prev => prev + 1);
      
      const verifiedResult = await verifyPurchaseWithRetry(result.id, 3);
      
      if (verifiedResult && isPurchased(verifiedResult)) {
        setResult(verifiedResult);
        setPurchaseStatus("complete");
        setAllowAccess(true);
        setVerificationSuccess(true);
      }
      
      setVerificationComplete(true);
      setIsVerifying(false);
    } catch (err: any) {
      console.error('Verification error:', err);
      setVerificationComplete(true);
      setIsVerifying(false);
    }
  };
  
  return { 
    result, 
    loading, 
    error, 
    purchaseStatus, 
    allowAccess,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    verificationAttempts,
    refreshPage,
    runVerification
  };
};
