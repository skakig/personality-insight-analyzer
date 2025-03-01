
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";

/**
 * Creates a query builder for updating results with purchase information
 */
export const createUpdateQuery = (resultId: string, userId?: string) => {
  // Start with base query
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
    
  // Add user filter if available
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  return query;
};

/**
 * Helper to update result with purchase info using different strategies
 */
export const updateResultWithSessionId = async (resultId: string, stripeSessionId: string, userId?: string) => {
  try {
    console.log('Updating result with session ID:', { resultId, stripeSessionId, userId });
    
    // First check if result already purchased
    const { data: currentResult } = await supabase
      .from('quiz_results')
      .select('is_purchased, purchase_status')
      .eq('id', resultId)
      .maybeSingle();
      
    if (currentResult?.is_purchased === true || currentResult?.purchase_status === 'completed') {
      console.log('Result already marked as purchased');
      return true;
    }
    
    // Update the session ID first to establish the link
    try {
      await supabase
        .from('quiz_results')
        .update({ stripe_session_id: stripeSessionId })
        .eq('id', resultId);
      
      console.log('Updated result with session ID');
    } catch (syncError) {
      console.error('Session ID sync error (non-critical):', syncError);
    }
    
    // Try update with user ID if available
    if (userId) {
      const { error: userError } = await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          stripe_session_id: stripeSessionId
        })
        .eq('id', resultId)
        .eq('user_id', userId);
        
      if (!userError) {
        console.log('Updated result with user ID filter');
        return true;
      }
      
      console.error('User ID update failed:', userError);
    }
    
    // Try update with session ID
    const { error: sessionError } = await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: stripeSessionId
      })
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId);
      
    if (!sessionError) {
      console.log('Updated result with session ID filter');
      return true;
    }
    
    console.error('Session ID update failed:', sessionError);
    
    // Last resort: direct update with just ID
    const { error: directError } = await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: stripeSessionId
      })
      .eq('id', resultId);
      
    if (!directError) {
      console.log('Updated result with direct ID only');
      return true;
    }
    
    console.error('Direct update failed:', directError);
    return false;
  } catch (error) {
    console.error('Error in updateResultWithSessionId:', error);
    return false;
  }
};
