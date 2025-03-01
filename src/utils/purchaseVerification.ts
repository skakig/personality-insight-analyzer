
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "./purchaseStatus";

/**
 * Checks purchase tracking status and returns the result if verified
 */
export const checkPurchaseTracking = async (trackingId: string, resultId: string) => {
  try {
    console.log('Checking purchase tracking:', { trackingId, resultId });
    
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
    if (!resultId || !stripeSessionId) {
      console.error('Missing parameters for purchase update:', { resultId, stripeSessionId });
      return false;
    }
    
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
    
    // If we have user_id, include it in the update filter for more precision
    let query = supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', resultId);
      
    // Add session ID filter
    query = query.eq('stripe_session_id', stripeSessionId);
    
    // Execute update
    const { error } = await query;
    
    if (error) {
      console.error('Error updating result with session ID:', error);
      
      // If failed with session ID, try with just the result ID
      const { error: directError } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', resultId);
        
      if (directError) {
        console.error('Direct update also failed:', directError);
        return false;
      }
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
