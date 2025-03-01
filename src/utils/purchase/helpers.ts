
import { supabase } from "@/integrations/supabase/client";

/**
 * Sleep utility function for retry mechanism
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to build the query based on authentication state
 */
export const buildQuery = (resultId: string, userId?: string, guestAccessToken?: string | null, guestEmail?: string | null) => {
  let query = supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId);
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestAccessToken) {
    query = query.eq('guest_access_token', guestAccessToken);
  } else if (guestEmail) {
    query = query.eq('guest_email', guestEmail);
  }
  
  return query;
};

/**
 * Helper function to fetch a result by ID
 */
export const fetchResult = async (resultId: string, userId?: string, guestAccessToken?: string | null) => {
  const query = buildQuery(resultId, userId, guestAccessToken);
  const { data: result, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Error fetching result:', error);
    return null;
  }
  
  return result;
};

/**
 * Get stored purchase data from localStorage
 */
export const getStoredPurchaseData = () => {
  return {
    trackingId: localStorage.getItem('purchaseTrackingId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    stripeSessionId: localStorage.getItem('stripeSessionId'),
    guestEmail: localStorage.getItem('guestEmail'),
    storedResultId: localStorage.getItem('purchaseResultId')
  };
};

/**
 * Try verification directly using user ID
 */
export const verifyWithUserId = async (resultId: string, userId: string) => {
  try {
    const { data: userResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle();
      
    return userResult;
  } catch (error) {
    console.error('Error in user verification:', error);
    return null;
  }
};

/**
 * Try verification with guest access token
 */
export const verifyWithGuestToken = async (resultId: string, guestAccessToken: string) => {
  try {
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_access_token', guestAccessToken)
      .maybeSingle();
    
    return result;
  } catch (error) {
    console.error('Error in guest token verification:', error);
    return null;
  }
};

/**
 * Try verification with guest email
 */
export const verifyWithGuestEmail = async (resultId: string, guestEmail: string) => {
  try {
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('guest_email', guestEmail)
      .maybeSingle();
    
    return result;
  } catch (error) {
    console.error('Error in guest email verification:', error);
    return null;
  }
};

/**
 * Try verification with stripe session id
 */
export const verifyWithStripeSession = async (resultId: string, stripeSessionId: string) => {
  try {
    const { data: result } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
    
    return result;
  } catch (error) {
    console.error('Error in stripe session verification:', error);
    return null;
  }
};

/**
 * Force update for a logged-in user with session ID
 */
export const forceUpdateForUser = async (resultId: string, userId: string) => {
  try {
    console.log('Attempting forced update for logged-in user');
    await supabase
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
      
    const { data: updatedResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .maybeSingle();
      
    return updatedResult;
  } catch (error) {
    console.error('Error in forced update:', error);
    return null;
  }
};
