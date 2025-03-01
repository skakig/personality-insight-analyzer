
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { updateResultWithPurchase } from "./resultUpdates";

/**
 * Helper function to verify purchase using only session ID
 */
export const manuallyVerifyWithSessionId = async (stripeSessionId: string, resultId: string) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for manual verification:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Manually verifying with session ID:', { stripeSessionId, resultId });
    
    // First check if any tracking record exists with this session ID
    const { data: trackingData, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (!trackingError && trackingData) {
      console.log('Found tracking record with session ID:', trackingData);
      
      // Update tracking status if needed
      if (trackingData.status !== 'completed') {
        await supabase
          .from('purchase_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', trackingData.id);
      }
    }
    
    // Try to update the result
    const updated = await updateResultWithPurchase(resultId, stripeSessionId);
    
    if (updated) {
      // Fetch the updated result
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result && isPurchased(result)) {
        console.log('Purchase verified via session ID only');
        return result;
      }
    }
  } catch (error) {
    console.error('Error in manual session verification:', error);
  }
  
  return null;
};

/**
 * Manually checks and updates purchase status using stripe session
 */
export const manuallyCheckStripeSession = async (stripeSessionId: string, resultId: string, queryBuilder: any) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for stripe session check:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Manually checking Stripe session:', stripeSessionId);
    
    // Check if the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // First check if the result already has this session ID and is purchased
    let resultQuery = supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId);
      
    // If user is logged in, add user filter
    if (userId) {
      resultQuery = resultQuery.eq('user_id', userId);
    }
    
    const { data: existingResult } = await resultQuery.maybeSingle();
      
    if (existingResult && isPurchased(existingResult)) {
      console.log('Purchase already verified via session ID match');
      return existingResult;
    }
    
    // Check if purchase_tracking has been completed for this session
    const { data: trackingData, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
    
    if (trackingError) {
      console.error('Failed to check tracking record:', trackingError);
    } else if (trackingData) {
      console.log('Found tracking record for session:', trackingData);
      
      // If tracking has guest email, store it
      if (trackingData.guest_email) {
        localStorage.setItem('guestEmail', trackingData.guest_email);
      }
      
      // Update tracking record if not completed
      if (trackingData.status !== 'completed') {
        await supabase
          .from('purchase_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', trackingData.id);
      }
      
      // Create update query
      let updateQuery = supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
        
      // Add user filter for logged-in users
      if (userId) {
        updateQuery = updateQuery.eq('user_id', userId);
      }
      
      const { error: updateError } = await updateQuery;
      
      if (updateError) {
        console.error('Failed to update result:', updateError);
        
        // Try without user filter as fallback
        const { error: fallbackError } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', resultId);
          
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
        }
      }
      
      // Fetch the updated result
      const { data: updatedResult, error: resultError } = await queryBuilder.maybeSingle();
      
      if (resultError) {
        console.error('Failed to fetch updated result:', resultError);
      } else if (updatedResult && isPurchased(updatedResult)) {
        console.log('Manual update successful via tracking record!');
        return updatedResult;
      }
    }
    
    // If no tracking record was found, try direct update
    const directUpdate = await updateResultWithPurchase(resultId, stripeSessionId);
    
    if (directUpdate) {
      const { data: directResult } = await queryBuilder.maybeSingle();
      
      if (directResult && isPurchased(directResult)) {
        console.log('Direct update successful!');
        return directResult;
      }
    }
    
    // Last resort: Try to find any result with this session ID
    const { data: anyResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (anyResult && anyResult.id === resultId && isPurchased(anyResult)) {
      console.log('Found result via session ID only');
      return anyResult;
    }
  } catch (error) {
    console.error('Manual stripe session check failed:', error);
  }
  
  return null;
};
