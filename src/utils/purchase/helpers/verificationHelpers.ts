
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
  console.log('Verification parameters:', params);
};

/**
 * Store the session ID from URL if present
 */
export const storeSessionIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log('Storing session ID from URL:', sessionId);
    localStorage.setItem('stripeSessionId', sessionId);
    return sessionId;
  }
  
  return null;
};

/**
 * Retrieve all stored purchase data from localStorage
 */
export const getStoredPurchaseData = () => {
  return {
    trackingId: localStorage.getItem('purchaseTrackingId'),
    guestAccessToken: localStorage.getItem('guestAccessToken'),
    stripeSessionId: localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId'),
    checkoutResultId: localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId'),
    checkoutUserId: localStorage.getItem('checkoutUserId'),
    guestEmail: localStorage.getItem('guestEmail'),
    initiatedAt: localStorage.getItem('purchaseInitiatedAt')
  };
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
    console.log('Attempting fast checkout verification with success=true in URL');
    
    // If we have success=true in the URL, let's update the result directly
    const { data, error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        ...(userId ? { user_id: userId } : {}),
        ...(guestEmail ? { guest_email: guestEmail } : {})
      })
      .eq('id', resultId)
      .select()
      .maybeSingle();
      
    if (error) {
      console.error('Fast verification update error:', error);
      return null;
    }
    
    if (data) {
      console.log('Fast verification successful!');
      
      // Send confirmation email
      try {
        const email = guestEmail || (await supabase.auth.getSession()).data.session?.user?.email;
        if (email) {
          await supabase.functions.invoke('send-results', {
            body: { email, resultId }
          });
          console.log('Confirmation email sent to:', email);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in fast checkout verification:', error);
  }
  
  return null;
};
