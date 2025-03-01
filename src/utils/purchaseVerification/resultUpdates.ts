
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a quiz result with purchase information
 */
export const updateResultWithPurchase = async (resultId: string, stripeSessionId: string) => {
  try {
    console.log('Updating result with stripe session ID:', stripeSessionId);
    
    const { data: result, error: fetchError } = await supabase
      .from('quiz_results')
      .select('guest_email, user_id, is_purchased, purchase_status')
      .eq('id', resultId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching result before update:', fetchError);
      return false;
    }
    
    // If already purchased, no need to update
    if (result?.is_purchased === true || result?.purchase_status === 'completed') {
      console.log('Result already marked as purchased');
      return true;
    }
    
    // If result has guest email, store it for later use
    if (result?.guest_email) {
      localStorage.setItem('guestEmail', result.guest_email);
    }
    
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
      .eq('stripe_session_id', stripeSessionId);
    
    if (error) {
      console.error('Error updating result with session ID:', error);
      return false;
    }
    
    // Also update purchase tracking record if it exists
    try {
      await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_session_id', stripeSessionId);
    } catch (trackingError) {
      console.error('Error updating purchase tracking:', trackingError);
      // Continue anyway, this is secondary
    }
    
    return true;
  } catch (updateError) {
    console.error('Error updating result with session ID:', updateError);
    return false;
  }
};
