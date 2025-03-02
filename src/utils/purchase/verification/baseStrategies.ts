
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../purchaseStatus";

/**
 * Verify purchase with user ID
 */
export const verifyWithUserId = async (resultId: string, userId: string) => {
  try {
    console.log('Verifying purchase with user ID:', userId);
    
    // Update the result as purchased
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
      .eq('user_id', userId);
      
    if (error) {
      console.error('User verification update error:', error);
      return null;
    }
    
    // Fetch the updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('User verification error:', error);
    return null;
  }
};

/**
 * Verify purchase with guest token
 */
export const verifyWithGuestToken = async (resultId: string, token: string) => {
  try {
    console.log('Verifying purchase with guest token');
    
    // First check if the token is valid
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_access_token', token)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with guest token');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        .eq('guest_access_token', token);
        
      if (error) {
        console.error('Guest token update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_access_token', token)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Guest token verification error:', error);
    return null;
  }
};

/**
 * Verify purchase with guest email
 */
export const verifyWithGuestEmail = async (resultId: string, email: string) => {
  try {
    console.log('Verifying purchase with guest email:', email);
    
    // Check if result exists with this email
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_email', email)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with guest email');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        .eq('guest_email', email);
        
      if (error) {
        console.error('Guest email update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', email)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Guest email verification error:', error);
    return null;
  }
};

/**
 * Verify purchase with Stripe session ID
 */
export const verifyWithStripeSession = async (resultId: string, sessionId: string) => {
  try {
    console.log('Verifying purchase with Stripe session ID:', sessionId);
    
    // First check if result exists with this session ID
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
      
    if (!result) {
      console.log('No result found with session ID');
      return null;
    }
    
    // Update to purchased if not already
    if (!isPurchased(result)) {
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
        .eq('stripe_session_id', sessionId);
        
      if (error) {
        console.error('Session ID update error:', error);
        return null;
      }
      
      // Fetch updated result
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        return updatedResult;
      }
    } else {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Session ID verification error:', error);
    return null;
  }
};

/**
 * Force update purchase status as a last resort
 */
export const forceUpdatePurchaseStatus = async (resultId: string) => {
  try {
    console.log('Force updating purchase status for result:', resultId);
    
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'forced_update'
      })
      .eq('id', resultId);
      
    if (error) {
      console.error('Force update error:', error);
      return null;
    }
    
    // Fetch updated result
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
      
    if (result && isPurchased(result)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Force update error:', error);
    return null;
  }
};
