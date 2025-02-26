
import { supabase } from "@/integrations/supabase/client";

export const isPurchased = (assessment: {
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}) => {
  return (
    assessment.is_purchased === true ||
    assessment.is_detailed === true ||
    assessment.access_method === 'purchase'
  );
};

export const hasAnyPurchasedReport = (assessments: Array<{
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}>) => {
  return assessments.some(assessment => isPurchased(assessment));
};

export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 10, delayMs = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data: result, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();

      if (error) throw error;
      
      if (result && isPurchased(result)) {
        return result;
      }

      // If not found or not purchased, wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error('Error verifying purchase:', error);
      // Continue retrying despite errors
    }
  }
  return null;
};
