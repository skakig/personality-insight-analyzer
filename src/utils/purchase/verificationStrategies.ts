
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { checkPurchaseTracking, updateResultWithPurchase } from "../purchaseVerification";

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

/**
 * Execute immediate verification strategies
 */
export const executeImmediateVerificationStrategies = async (
  resultId: string,
  userId?: string | null,
  trackingId?: string | null,
  sessionId?: string | null,
  guestToken?: string | null,
  guestEmail?: string | null
) => {
  console.log('Executing immediate verification strategies');
  
  // Check if the result is already purchased
  const { data: directResult } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
    
  if (directResult && isPurchased(directResult)) {
    console.log('Result already purchased');
    return directResult;
  }
  
  // Try verification with tracking ID
  if (trackingId) {
    console.log('Checking tracking ID:', trackingId);
    const trackingResult = await checkPurchaseTracking(trackingId, resultId);
    if (trackingResult) {
      console.log('Verified via tracking ID');
      return trackingResult;
    }
  }
  
  // Try verification with user ID
  if (userId) {
    console.log('Checking user ID:', userId);
    const userResult = await verifyWithUserId(resultId, userId);
    if (userResult) {
      console.log('Verified via user ID');
      return userResult;
    }
  }
  
  // Try verification with Stripe session ID
  if (sessionId) {
    console.log('Checking session ID:', sessionId);
    const sessionResult = await verifyWithStripeSession(resultId, sessionId);
    if (sessionResult) {
      console.log('Verified via session ID');
      return sessionResult;
    }
    
    // Also try to update with session ID
    const updated = await updateResultWithPurchase(resultId, sessionId);
    if (updated) {
      const { data: updatedResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (updatedResult && isPurchased(updatedResult)) {
        console.log('Verified via result update with session ID');
        return updatedResult;
      }
    }
  }
  
  // Try verification with guest token
  if (guestToken) {
    console.log('Checking guest token');
    const tokenResult = await verifyWithGuestToken(resultId, guestToken);
    if (tokenResult) {
      console.log('Verified via guest token');
      return tokenResult;
    }
  }
  
  // Try verification with guest email
  if (guestEmail) {
    console.log('Checking guest email:', guestEmail);
    const emailResult = await verifyWithGuestEmail(resultId, guestEmail);
    if (emailResult) {
      console.log('Verified via guest email');
      return emailResult;
    }
  }
  
  console.log('All immediate verification strategies failed');
  return null;
};

/**
 * Execute retry-based verification strategies
 */
export const executeRetryVerificationStrategies = async (
  resultId: string,
  maxRetries: number,
  delayMs: number,
  userId?: string | null,
  trackingId?: string | null,
  sessionId?: string | null,
  guestToken?: string | null,
  guestEmail?: string | null
) => {
  console.log('Executing retry-based verification strategies');
  
  let retries = 0;
  while (retries < maxRetries) {
    retries++;
    console.log(`Verification retry ${retries}/${maxRetries}`);
    
    // Wait before trying again
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // Try the immediate strategies again
    const result = await executeImmediateVerificationStrategies(
      resultId,
      userId,
      trackingId,
      sessionId,
      guestToken,
      guestEmail
    );
    
    if (result) {
      console.log('Verified on retry:', retries);
      return result;
    }
  }
  
  console.log('All retry verification strategies failed');
  return null;
};

/**
 * Execute fallback verification as last resort
 */
export const executeFallbackVerification = async (resultId: string) => {
  console.log('Executing fallback verification strategy');
  
  // Last resort: direct update without any filters
  return await forceUpdatePurchaseStatus(resultId);
};
