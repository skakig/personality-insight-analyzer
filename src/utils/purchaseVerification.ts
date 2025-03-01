
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";

/**
 * Checks purchase tracking status and returns the result if verified
 */
export const checkPurchaseTracking = async (trackingId: string, resultId: string) => {
  try {
    const { data: tracking, error } = await supabase
      .from('purchase_tracking')
      .select('status, completed_at, guest_email, stripe_session_id')
      .eq('id', trackingId)
      .maybeSingle();
    
    if (error) {
      console.error('Failed to check purchase tracking:', error);
      return null;
    }
      
    if (tracking?.status === 'completed') {
      console.log('Purchase verified via tracking record');
      
      // If tracking has guest email, store it
      if (tracking.guest_email) {
        localStorage.setItem('guestEmail', tracking.guest_email);
      }
      
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
      
      // If result exists but isn't marked as purchased, try to update it
      if (result && tracking.stripe_session_id) {
        const updated = await updateResultWithPurchase(resultId, tracking.stripe_session_id);
        if (updated) {
          const { data: updatedResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (updatedResult && isPurchased(updatedResult)) {
            return updatedResult;
          }
        }
      }
    } else if (tracking?.stripe_session_id) {
      // Even if tracking isn't completed, try to use the session ID to verify
      return await manuallyVerifyWithSessionId(tracking.stripe_session_id, resultId);
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

/**
 * Helper function to verify purchase using only session ID
 */
export const manuallyVerifyWithSessionId = async (stripeSessionId: string, resultId: string) => {
  try {
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
    console.log('Manually checking Stripe session:', stripeSessionId);
    
    // First check if the result already has this session ID and is purchased
    const { data: existingResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
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
      
      // Update the result directly
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
      
      if (updateError) {
        console.error('Failed to update result:', updateError);
      } else {
        // Fetch the updated result
        const { data: updatedResult, error: resultError } = await queryBuilder.maybeSingle();
        
        if (resultError) {
          console.error('Failed to fetch updated result:', resultError);
        } else if (updatedResult && isPurchased(updatedResult)) {
          console.log('Manual update successful via tracking record!');
          return updatedResult;
        }
      }
    }
    
    // If no tracking record was found, try to update directly
    const updated = await updateResultWithPurchase(resultId, stripeSessionId);
    if (updated) {
      const { data: updatedResult, error: resultError } = await queryBuilder.maybeSingle();
      
      if (resultError) {
        console.error('Failed to fetch updated result:', resultError);
      } else if (updatedResult && isPurchased(updatedResult)) {
        console.log('Manual direct update successful!');
        return updatedResult;
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
