
/**
 * Verification strategies for guest users
 */
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Verify purchase with guest token
 */
export const verifyWithGuestToken = async (resultId: string, accessToken: string): Promise<QuizResult | null> => {
  try {
    console.log('[DEBUG] Verifying purchase with guest token');
    
    // Update the result as purchased
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', resultId)
      .eq('guest_access_token', accessToken);
      
    if (error) {
      console.error('[ERROR] Guest token verification error:', error);
      return null;
    }
    
    // Fetch the updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result as QuizResult;
    }
    
    return null;
  } catch (error) {
    console.error('[ERROR] Guest token verification error:', error);
    return null;
  }
};

/**
 * Verify purchase with guest email
 */
export const verifyWithGuestEmail = async (resultId: string, email: string): Promise<QuizResult | null> => {
  try {
    console.log('[DEBUG] Verifying purchase with guest email:', email);
    
    // Update the result as purchased
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', resultId)
      .eq('guest_email', email);
      
    if (error) {
      console.error('[ERROR] Guest email verification error:', error);
      return null;
    }
    
    // Fetch the updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_email', email)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result as QuizResult;
    }
    
    return null;
  } catch (error) {
    console.error('[ERROR] Guest email verification error:', error);
    return null;
  }
};
