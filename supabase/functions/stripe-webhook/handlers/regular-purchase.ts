
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handleRegularPurchase(
  session: Stripe.Checkout.Session,
  userId?: string
) {
  console.log('Processing regular purchase for user:', userId || 'Unknown user');
  
  try {
    // Extract resultId from metadata
    let resultId = session.metadata?.resultId;
    
    // If resultId is missing, try to recover it
    if (!resultId) {
      console.warn('resultId missing from metadata, attempting recovery methods');
      
      // Attempt to find resultId in purchase_tracking using session ID
      const { data: purchaseTracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .select('quiz_result_id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();
      
      if (purchaseTracking?.quiz_result_id) {
        console.log('Recovered resultId from purchase_tracking:', purchaseTracking.quiz_result_id);
        resultId = purchaseTracking.quiz_result_id;
      } else if (trackingError) {
        console.error('Error querying purchase_tracking:', trackingError);
      }
      
      // If still not found, try to find by userId + latest record
      if (!resultId && userId) {
        console.log('Attempting to find latest quiz result for user:', userId);
        const { data: latestResult, error: latestError } = await supabase
          .from('quiz_results')
          .select('id')
          .eq('user_id', userId)
          .eq('is_purchased', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (latestResult?.id) {
          console.log('Recovered resultId from latest user result:', latestResult.id);
          resultId = latestResult.id;
        } else if (latestError) {
          console.error('Error finding latest result:', latestError);
        }
      }
      
      // If still no resultId, we can't proceed
      if (!resultId) {
        console.error('Could not recover resultId, cannot update quiz result');
        return;
      }
    }
    
    // First update purchase_tracking record if it exists
    const { error: trackingUpdateError } = await supabase
      .from('purchase_tracking')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stripe_session_id: session.id
      })
      .eq('quiz_result_id', resultId);
    
    if (trackingUpdateError) {
      console.warn('Error updating purchase tracking:', trackingUpdateError);
      // Continue anyway as updating quiz_results is more important
    }
    
    // Now update the quiz result
    const updateData = {
      is_purchased: true,
      is_detailed: true,
      access_method: 'purchase',
      purchase_status: 'completed',
      purchase_completed_at: new Date().toISOString(),
      stripe_session_id: session.id
    };
    
    // If userId is available, add it to the update data
    if (userId) {
      updateData.user_id = userId;
    }
    
    // First try to update with both resultId and userId (most precise)
    let updateSuccess = false;
    
    if (userId) {
      const { error: userResultError, count } = await supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId)
        .eq('user_id', userId);
      
      if (!userResultError && count > 0) {
        console.log('Successfully updated quiz result with user ID match');
        updateSuccess = true;
      } else if (userResultError) {
        console.warn('Failed to update with user ID match:', userResultError);
      }
    }
    
    // If the user ID match didn't work, try with just the result ID
    if (!updateSuccess) {
      const { error: resultError } = await supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);
      
      if (resultError) {
        console.error('Error updating quiz result:', resultError);
        return;
      }
      
      console.log('Successfully updated quiz result with resultId only');
    }
    
    console.log('Regular purchase successfully processed');
    
  } catch (error) {
    console.error('Error in handleRegularPurchase:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}
