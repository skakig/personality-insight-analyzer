import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "@/utils/purchaseStatus";
import { clearPurchaseData, getPurchaseData } from "@/utils/purchaseStateUtils";

/**
 * Helper function to verify a result using only a session ID
 */
export const verifyResultWithSessionId = async (stripeSessionId: string, resultId: string) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for verification:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Verifying result with session ID:', { stripeSessionId, resultId });
    
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
        console.log('Purchase verified via session ID');
        return result;
      }
    }
  } catch (error) {
    console.error('Error in session verification:', error);
  }
  
  return null;
};

/**
 * Attempts to fetch a result directly by ID and session ID
 */
export const fetchResultBySessionId = async (resultId: string, stripeSessionId: string) => {
  try {
    const { data: result, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching result by session ID:', error);
      return null;
    }
    
    if (result && isPurchased(result)) {
      console.log('Found purchased result by session ID');
      return result;
    }
    
    console.log('Result not found or not purchased by session ID');
    return null;
  } catch (error) {
    console.error('Error in fetchResultBySessionId:', error);
    return null;
  }
};

/**
 * Attempts to find any result associated with the given session ID
 */
export const findAnyResultBySessionId = async (stripeSessionId: string) => {
  try {
    const { data: result, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (error) {
      console.error('Error finding any result by session ID:', error);
      return null;
    }
    
    if (result && isPurchased(result)) {
      console.log('Found purchased result by session ID');
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Error in findAnyResultBySessionId:', error);
    return null;
  }
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
