
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QuizResult } from '@/types/quiz';
import { isPurchased } from '@/utils/purchaseStatus';

export function useAssessmentResult(resultId: string | null) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  // Add compatibility properties for existing code
  const isVerifying = loading;
  const verificationComplete = !loading;
  const verificationSuccess = !loading && !error && !!result;
  
  const runVerification = async (id: string, sessionId?: string, userId?: string) => {
    if (!id) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        setError(`Error fetching assessment: ${fetchError.message}`);
        return false;
      }
      
      // Handle the data transformation to match QuizResult type
      const typedResult: QuizResult = {
        id: data.id,
        user_id: data.user_id,
        personality_type: data.personality_type,
        is_purchased: data.is_purchased,
        is_detailed: data.is_detailed,
        purchase_status: data.purchase_status as 'pending' | 'completed' | null,
        access_method: data.access_method as 'purchase' | 'free' | 'credit' | 'subscription' | 'forced_update' | null,
        stripe_session_id: data.stripe_session_id,
        guest_email: data.guest_email,
        guest_access_token: data.guest_access_token,
        purchase_initiated_at: data.purchase_initiated_at,
        purchase_completed_at: data.purchase_completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        detailed_analysis: data.detailed_analysis,
        category_scores: data.category_scores as Record<string, number> | null,
        answers: data.answers
      };
      
      setResult(typedResult);
      return isPurchased(typedResult);
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // For compatibility with existing code
  const verifyPurchase = async (id: string, maxRetries = 3) => {
    return runVerification(id);
  };
  
  useEffect(() => {
    if (resultId) {
      runVerification(resultId);
    }
  }, [resultId]);
  
  return {
    result,
    loading,
    error,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runVerification,
    verifyPurchase,
    verified: !loading && !error && !!result
  };
}
