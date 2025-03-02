
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper functions for direct database verification
 */
export const checkDirectPurchaseStatus = async (resultId: string) => {
  try {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('is_purchased', true)
      .maybeSingle();
      
    return data;
  } catch (error) {
    console.error('Direct purchase check failed:', error);
    return null;
  }
};

export const attemptFastCheckoutVerification = async (
  resultId: string,
  sessionId?: string | null,
  userId?: string | null,
  checkoutUserId?: string | null,
  guestEmail?: string | null,
  urlSuccess?: boolean
) => {
  if (!urlSuccess || !sessionId) return null;
  
  try {
    const updateData = {
      is_purchased: true,
      is_detailed: true,
      purchase_status: 'completed',
      purchase_completed_at: new Date().toISOString(),
      access_method: 'purchase',
      ...(userId ? { user_id: userId } : {}),
      ...(guestEmail ? { guest_email: guestEmail } : {})
    };
    
    await supabase
      .from('quiz_results')
      .update(updateData)
      .eq('id', resultId);
      
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    return result;
  } catch (error) {
    console.error('Fast verification failed:', error);
    return null;
  }
};

