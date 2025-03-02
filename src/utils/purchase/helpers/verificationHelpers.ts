
/**
 * Helper functions for purchase verification
 */

import { supabase } from "@/integrations/supabase/client";

export const getUrlVerificationParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    urlSuccess: urlParams.get('success') === 'true',
    urlSessionId: urlParams.get('session_id')
  };
};

export const logVerificationParameters = (params: {
  resultId: string;
  userId?: string | null;
  trackingId?: string | null;
  sessionId?: string | null;
  guestToken?: string | null;
  guestEmail?: string | null;
  urlSuccess?: boolean;
  maxRetries: number;
  delayMs: number;
}) => {
  console.log('[DEBUG] Verification parameters:', params);
};

/**
 * Store the session ID from URL if present
 */
export const storeSessionIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log('[DEBUG] Storing session ID from URL:', sessionId);
    localStorage.setItem('stripeSessionId', sessionId);
    return sessionId;
  }
  
  return null;
};

/**
 * Retrieve all stored purchase data from localStorage
 */
export const getStoredPurchaseData = () => {
  const data = {
    trackingId: localStorage.getItem('purchaseTrackingId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    stripeSessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    checkoutResultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    checkoutUserId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt'),
    resultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    storedResultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId')
  };
  
  console.log('[DEBUG] Retrieved stored purchase data:', {
    hasTrackingId: !!data.trackingId,
    hasGuestToken: !!data.guestAccessToken,
    hasSessionId: !!data.stripeSessionId,
    hasResultId: !!data.resultId,
    hasUserId: !!data.checkoutUserId,
    hasEmail: !!data.guestEmail
  });
  
  return data;
};

/**
 * Quick verification for users returning from Stripe checkout
 */
export const attemptFastCheckoutVerification = async (
  resultId: string,
  sessionId?: string | null,
  userId?: string | null,
  checkoutUserId?: string | null,
  guestEmail?: string | null,
  urlSuccess?: boolean
) => {
  if (!urlSuccess) return null;
  
  try {
    console.log('[DEBUG] Attempting fast checkout verification with success=true in URL', {
      resultId,
      hasSessionId: !!sessionId,
      hasUserId: !!userId,
      hasCheckoutUserId: !!checkoutUserId,
      hasGuestEmail: !!guestEmail
    });
    
    // Fetch current state first
    const { data: currentState, error: stateError } = await supabase
      .from('quiz_results')
      .select('id, is_purchased, purchase_status')
      .eq('id', resultId)
      .maybeSingle();
      
    if (stateError) {
      console.error('[ERROR] Error checking current state:', stateError);
    } else if (currentState?.is_purchased) {
      console.log('[DEBUG] Result already purchased, skipping fast verification');
      return null;
    }
    
    // If we have success=true in the URL, let's update the result directly
    const updateFields = {
      is_purchased: true,
      is_detailed: true,
      purchase_status: 'completed',
      purchase_completed_at: new Date().toISOString(),
      access_method: 'purchase'
    };
    
    // Add user ID if available
    if (userId) {
      Object.assign(updateFields, { user_id: userId });
    } else if (checkoutUserId) {
      Object.assign(updateFields, { user_id: checkoutUserId });
    }
    
    // Add guest email if available
    if (guestEmail) {
      Object.assign(updateFields, { guest_email: guestEmail });
    }
    
    // Add session ID if available
    if (sessionId) {
      Object.assign(updateFields, { stripe_session_id: sessionId });
    }
    
    const { data, error } = await supabase
      .from('quiz_results')
      .update(updateFields)
      .eq('id', resultId)
      .select()
      .maybeSingle();
      
    if (error) {
      console.error('[ERROR] Fast verification update error:', error);
      return null;
    }
    
    if (data) {
      console.log('[DEBUG] Fast verification successful!', {
        is_purchased: data.is_purchased,
        purchase_status: data.purchase_status
      });
      
      // Send confirmation email
      try {
        const email = guestEmail || (await supabase.auth.getSession()).data.session?.user?.email;
        if (email) {
          await supabase.functions.invoke('send-results', {
            body: { email, resultId }
          });
          console.log('[DEBUG] Confirmation email sent to:', email);
        }
      } catch (emailError) {
        console.error('[ERROR] Error sending confirmation email:', emailError);
      }
      
      return data;
    }
  } catch (error) {
    console.error('[ERROR] Error in fast checkout verification:', error);
  }
  
  return null;
};
