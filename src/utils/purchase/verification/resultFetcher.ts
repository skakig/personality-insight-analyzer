
/**
 * Utility to fetch and process quiz results
 */
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";

/**
 * Fetch the latest quiz result by ID
 */
export const fetchLatestResult = async (resultId: string): Promise<QuizResult | null> => {
  try {
    console.log(`[DEBUG] Fetching latest result for ID: ${resultId}`);
    
    if (!resultId) {
      console.error('[ERROR] No result ID provided to fetchLatestResult');
      return null;
    }
    
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
    
    if (error) {
      console.error('[ERROR] Failed to fetch result:', error);
      return null;
    }
    
    if (!data) {
      console.log('[DEBUG] No result found with ID:', resultId);
      return null;
    }
    
    // Process and return the result with proper type handling
    const result: QuizResult = {
      id: data.id,
      user_id: data.user_id,
      personality_type: data.personality_type,
      is_purchased: data.is_purchased ?? false,
      is_detailed: data.is_detailed ?? false,
      purchase_status: data.purchase_status,
      access_method: data.access_method,
      stripe_session_id: data.stripe_session_id,
      guest_email: data.guest_email,
      guest_access_token: data.guest_access_token,
      purchase_initiated_at: data.purchase_initiated_at,
      purchase_completed_at: data.purchase_completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at || null,
      detailed_analysis: data.detailed_analysis,
      // Handle category_scores properly to avoid type issues
      category_scores: typeof data.category_scores === 'string' 
        ? JSON.parse(data.category_scores) 
        : (data.category_scores as Record<string, number> | null),
      answers: data.answers,
      temp_access_token: data.temp_access_token,
      temp_access_expires_at: data.temp_access_expires_at,
      guest_access_expires_at: data.guest_access_expires_at,
      purchase_date: data.purchase_date,
      purchase_amount: data.purchase_amount,
      primary_level: data.primary_level || null,
      conversions: data.conversions || 0
    };
    
    console.log('[DEBUG] Successfully fetched and processed result');
    return result;
  } catch (error) {
    console.error('[ERROR] Error in fetchLatestResult:', error);
    return null;
  }
};
