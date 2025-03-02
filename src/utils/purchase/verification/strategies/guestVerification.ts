
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../../purchaseStatus";

/**
 * Verify purchase with guest token
 */
export const verifyWithGuestToken = async (resultId: string, token: string) => {
  try {
    console.log('Verifying purchase with guest token');
    
    // First check if the token is valid
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_access_token', token)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with guest token');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        .eq('guest_access_token', token);
        
      if (error) {
        console.error('Guest token update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_access_token', token)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Guest token verification error:', error);
    return null;
  }
};

/**
 * Verify purchase with guest email
 */
export const verifyWithGuestEmail = async (resultId: string, email: string) => {
  try {
    console.log('Verifying purchase with guest email:', email);
    
    // Check if result exists with this email
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_email', email)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with guest email');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        console.error('Guest email update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', email)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Guest email verification error:', error);
    return null;
  }
};
