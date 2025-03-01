
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";

/**
 * Handles checking purchase tracking status
 */
export const checkPurchaseTracking = async (trackingId: string, resultId: string) => {
  const { data: tracking } = await supabase
    .from('purchase_tracking')
    .select('status, completed_at')
    .eq('id', trackingId)
    .maybeSingle();
    
  if (tracking?.status === 'completed') {
    console.log('Purchase verified via tracking record');
    // If tracking is complete, fetch the result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result;
    }
  }
  
  return null;
};

/**
 * Updates a quiz result with purchase information
 */
export const updateResultWithPurchase = async (resultId: string, stripeSessionId: string) => {
  try {
    console.log('Trying to update result with stripe session ID:', stripeSessionId);
    await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId);
    
    return true;
  } catch (updateError) {
    console.error('Error updating result with session ID:', updateError);
    return false;
  }
};

/**
 * Manually checks and updates purchase status using stripe session
 */
export const manuallyCheckStripeSession = async (stripeSessionId: string, resultId: string, queryBuilder: any) => {
  try {
    console.log('Attempting to manually check Stripe session:', stripeSessionId);
    
    // Check if purchase_tracking has been completed for this session
    const { data: trackingData } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .eq('status', 'completed')
      .maybeSingle();
      
    if (trackingData) {
      console.log('Found completed tracking record:', trackingData);
      
      // Update the result directly
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
        
      // Fetch the updated result
      const { data: updatedResult } = await queryBuilder.maybeSingle();
      if (updatedResult && isPurchased(updatedResult)) {
        console.log('Manual update successful via tracking record!');
        return updatedResult;
      }
    }
  } catch (webhookError) {
    console.error('Manual webhook check failed:', webhookError);
  }
  
  return null;
};
