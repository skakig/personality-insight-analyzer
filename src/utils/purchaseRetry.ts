
/**
 * Utility for retrying purchase verification
 */
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { verifyPurchaseWithRetry } from "./purchaseUtils";

export const retryPurchaseVerification = async (result: QuizResult, maxRetries = 3): Promise<QuizResult | null> => {
  try {
    // Convert category_scores to the right type if needed
    if (result.category_scores && typeof result.category_scores === 'string') {
      result.category_scores = JSON.parse(result.category_scores) as Record<string, number>;
    }
    
    // Try verification
    const verifiedResult = await verifyPurchaseWithRetry(result.id, maxRetries);
    
    if (verifiedResult) {
      return verifiedResult;
    }
    
    // If verification fails, just return the original result
    return result;
  } catch (error) {
    console.error('Error retrying purchase verification:', error);
    return result;
  }
};

export const fetchResult = async (id: string): Promise<QuizResult | null> => {
  if (!id) return null;
  
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching result:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Convert the data to QuizResult type
    const result: QuizResult = {
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
      updated_at: data.updated_at || data.created_at,
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
      primary_level: data.primary_level
    };
    
    return result;
  } catch (error) {
    console.error('Error in fetchResult:', error);
    return null;
  }
};
