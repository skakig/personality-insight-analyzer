
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../purchaseStatus";

/**
 * Perform fast verification for users just returning from successful Stripe checkout
 */
export const attemptFastCheckoutVerification = async (
  resultId: string,
  sessionId: string | null | undefined,
  userId: string | null | undefined,
  checkoutUserId: string | null | undefined,
  guestEmail: string | null | undefined,
  urlSuccess: boolean
) => {
  if (!urlSuccess || !sessionId) return null;
  
  try {
    console.log('Detected return from successful checkout, attempting fast verification');
    
    // For logged-in users
    if (userId || checkoutUserId) {
      console.log('Attempting direct update for logged-in user');
      const userIdToUse = userId || checkoutUserId;
      
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          user_id: userIdToUse
        })
        .eq('id', resultId);
        
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result && isPurchased(result)) {
        console.log('Fast purchase verification successful!');
        return result;
      }
    }
    
    // For guest users
    if (guestEmail) {
      console.log('Attempting direct update for guest user');
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          guest_email: guestEmail
        })
        .eq('id', resultId);
        
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result && isPurchased(result)) {
        console.log('Fast purchase verification successful for guest!');
        return result;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Fast verification attempt failed:', error);
    return null;
  }
};
