
import { supabase } from "@/integrations/supabase/client";
import { updateResultWithPurchase } from "../../purchaseVerification";
import { getStoredPurchaseData } from "../helpers";

/**
 * Gets all verification parameters from storage and URL
 */
export const getVerificationParameters = () => {
  const { 
    trackingId, 
    guestAccessToken, 
    stripeSessionId, 
    guestEmail, 
    checkoutResultId,  // Use correct property name
    checkoutUserId
  } = getStoredPurchaseData();
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlSuccess = urlParams.get('success') === 'true';
  const urlSessionId = urlParams.get('session_id');
  
  // If we have a session ID in the URL but not in localStorage, store it
  const sessionIdToUse = urlSessionId || stripeSessionId;
  if (urlSessionId && !stripeSessionId) {
    localStorage.setItem('stripeSessionId', urlSessionId);
    console.log('Stored session ID from URL parameters');
  }
  
  return {
    trackingId,
    guestAccessToken,
    stripeSessionId: sessionIdToUse,
    guestEmail,
    storedResultId: checkoutResultId,  // Use correct property
    checkoutUserId,
    urlSuccess,
    urlSessionId
  };
};

/**
 * Quick check for already purchased result
 */
export const checkForExistingPurchase = async (resultId: string) => {
  const { data: directResult } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
  
  return directResult;
};

/**
 * Fast checkout verification for users returning from Stripe
 */
export const attemptFastVerification = async (
  resultId: string, 
  userId: string | null | undefined, 
  sessionId: string | null | undefined,
  guestEmail: string | null | undefined,
  urlSuccess: boolean
) => {
  if (!urlSuccess || !sessionId) return null;
  
  try {
    console.log('Attempting fast verification after Stripe checkout');
    
    // For logged-in users
    if (userId) {
      console.log('Fast verification for logged-in user');
      
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          user_id: userId 
        })
        .eq('id', resultId);
        
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result) {
        console.log('Fast verification successful for logged-in user');
        return result;
      }
    }
    
    // For guest users
    if (guestEmail) {
      console.log('Fast verification for guest user');
      
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase',
          guest_email: guestEmail
        })
        .eq('id', resultId);
        
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result) {
        console.log('Fast verification successful for guest user');
        return result;
      }
    }
  } catch (error) {
    console.error('Fast verification failed:', error);
  }
  
  return null;
};

/**
 * Update result with session ID info
 */
export const updateResultSession = async (resultId: string, sessionId: string) => {
  if (!resultId || !sessionId) return false;
  
  try {
    await supabase
      .from('quiz_results')
      .update({ stripe_session_id: sessionId })
      .eq('id', resultId);
    
    return true;
  } catch (error) {
    console.error('Failed to update result with session ID:', error);
    return false;
  }
};

/**
 * Database check for user purchase
 */
export const checkResultPurchaseStatus = async (resultId: string, userId?: string) => {
  try {
    let query = supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: result } = await query.maybeSingle();
    return result;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return null;
  }
};
