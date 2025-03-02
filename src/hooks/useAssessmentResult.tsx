import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useVerifyPurchase } from './assessment/useVerifyPurchase';
import { QuizResultType } from '@/types/quiz'; // Use QuizResultType instead of QuizResult
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAssessmentResult = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { 
    isVerifying, 
    verificationComplete, 
    verificationSuccess,
    runVerification,
    runFallbackVerification 
  } = useVerifyPurchase();
  
  const { session } = useAuth(); // Use session instead of user
  const [result, setResult] = useState<QuizResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add properties expected by the consuming components to match the existing interface
  const verifying = isVerifying;
  const verificationAttempts = 0; // Placeholder value
  const checkDirectAccess = useCallback(() => Promise.resolve(false), []); // Placeholder function
  const showCreateAccountToast = useCallback(() => {}, []); // Placeholder function
  const executeVerificationFlow = useCallback(() => Promise.resolve(false), []); // Placeholder function

  // Fix the runVerification call to match expected signature
  const verifyResult = useCallback(() => {
    if (id) {
      return runVerification(id);
    }
    return Promise.resolve(false);
  }, [id, runVerification]);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) {
          throw new Error("Assessment ID is missing.");
        }
        
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setResult(data);
        } else {
          setError("Result not found.");
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to fetch assessment result: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [id, session, toast]);

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
  };
};
