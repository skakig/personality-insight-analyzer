
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
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Query with user_id if logged in
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId);
        
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data: result, error } = await query.maybeSingle();

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
  } catch (error) {
    console.error('Session error:', error);
  }
  return null;
};
