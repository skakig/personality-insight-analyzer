
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { executeVerification } from "@/utils/purchase/verificationCore";

export const useAssessmentResult = (id: string | undefined) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { user } = useAuth();

  // Fetch the result
  const fetchResult = async (resultId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
      
      if (error) throw error;
      
      setResult(data);
      return data;
    } catch (error) {
      console.error('Error fetching result:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Run purchase verification
  const runVerification = async () => {
    if (!id) return false;
    
    try {
      setVerifying(true);
      setVerificationAttempts(prev => prev + 1);
      
      console.log('Running purchase verification for result:', id);
      
      const verifiedResult = await executeVerification(id);
      
      if (verifiedResult) {
        setResult(verifiedResult);
        setVerificationSuccess(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    } finally {
      setVerifying(false);
    }
  };
  
  // Refresh the page
  const refreshPage = () => {
    if (id) {
      setVerifying(true);
      fetchResult(id).then(() => {
        runVerification();
      });
    }
  };

  // Initial data fetch and verification
  useEffect(() => {
    if (id) {
      fetchResult(id).then((data) => {
        if (data && !data.is_purchased) {
          runVerification();
        }
      });
    }
  }, [id]);

  return {
    result,
    loading,
    verifying,
    verificationAttempts,
    verificationSuccess,
    refreshPage
  };
};
