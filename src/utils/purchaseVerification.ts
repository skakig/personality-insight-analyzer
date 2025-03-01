
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";

/**
 * Checks purchase tracking status and returns the result if verified
 */
export const checkPurchaseTracking = async (trackingId: string, resultId: string) => {
  try {
    const { data: tracking, error } = await supabase
      .from('purchase_tracking')
      .select('status, completed_at')
      .eq('id', trackingId)
      .maybeSingle();
    
    if (error) {
      console.error('Failed to check purchase tracking:', error);
      return null;
    }
      
    if (tracking?.status === 'completed') {
      console.log('Purchase verified via tracking record');
      
      // If tracking is complete, fetch the result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (resultError) {
        console.error('Failed to fetch quiz result:', resultError);
        return null;
      }
        
      if (result && isPurchased(result)) {
        return result;
      }
    }
  } catch (error) {
    console.error('Error checking purchase tracking:', error);
  }
  
  return null;
};

/**
 * Updates a quiz result with purchase information
 */
export const updateResultWithPurchase = async (resultId: string, stripeSessionId: string) => {
  try {
    console.log('Updating result with stripe session ID:', stripeSessionId);
    
    const { error } = await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
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
    console.log('Manually checking Stripe session:', stripeSessionId);
    
    // Check if purchase_tracking has been completed for this session
    const { data: trackingData, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .eq('status', 'completed')
      .maybeSingle();
    
    if (trackingError) {
      console.error('Failed to check tracking record:', trackingError);
      return null;
    }
      
    if (trackingData) {
      console.log('Found completed tracking record:', trackingData);
      
      // Update the result directly
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
      
      if (updateError) {
        console.error('Failed to update result:', updateError);
        return null;
      }
        
      // Fetch the updated result
      const { data: updatedResult, error: resultError } = await queryBuilder.maybeSingle();
      
      if (resultError) {
        console.error('Failed to fetch updated result:', resultError);
        return null;
      }
      
      if (updatedResult && isPurchased(updatedResult)) {
        console.log('Manual update successful via tracking record!');
        return updatedResult;
      }
    }
  } catch (error) {
    console.error('Manual stripe session check failed:', error);
  }
  
  return null;
};
