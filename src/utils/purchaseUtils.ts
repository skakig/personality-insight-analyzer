
import { supabase } from "@/integrations/supabase/client";

export const isPurchased = (assessment: {
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}) => {
  return (
    assessment.is_purchased === true ||
    assessment.is_detailed === true ||
    assessment.access_method === 'purchase'
  );
};

export const hasAnyPurchasedReport = (assessments: Array<{
  is_purchased?: boolean;
  is_detailed?: boolean;
  access_method?: string | null;
}>) => {
  return assessments.some(assessment => isPurchased(assessment));
};

export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 10, delayMs = 2000) => {
  try {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Get stored session data from localStorage
    const trackingId = localStorage.getItem('purchaseTrackingId');
    const guestAccessToken = localStorage.getItem('guestAccessToken');
    const stripeSessionId = localStorage.getItem('stripeSessionId');
    
    console.log('Starting purchase verification with retry:', { 
      resultId, 
      userId: userId || 'guest',
      hasTrackingId: !!trackingId,
      hasGuestToken: !!guestAccessToken,
      hasStripeSession: !!stripeSessionId,
      maxRetries, 
      delayMs 
    });

    // Try to check tracking status first if we have a tracking ID
    if (trackingId) {
      const { data: tracking } = await supabase
        .from('purchase_tracking')
        .select('status')
        .eq('id', trackingId)
        .single();
        
      if (tracking?.status === 'completed') {
        console.log('Purchase verified via tracking record');
        // If tracking is complete, fetch the result
        const { data: result } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId)
          .maybeSingle();
          
        if (result && isPurchased(result)) {
          return result;
        }
      }
    }

    for (let i = 0; i < maxRetries; i++) {
      console.log(`Verification attempt ${i + 1} of ${maxRetries}`);
      
      try {
        // Query with user_id if logged in
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId);
        
        if (userId) {
          query = query.eq('user_id', userId);
        } else if (guestAccessToken) {
          query = query.eq('guest_access_token', guestAccessToken);
        }

        const { data: result, error } = await query.maybeSingle();

        if (error) {
          console.error('Error in verification query:', error);
          throw error;
        }
        
        if (result && isPurchased(result)) {
          console.log('Purchase verified successfully on attempt', i + 1);
          return result;
        }

        console.log(`Attempt ${i + 1} failed, result not purchased yet`);

        // If this is the first attempt and we have a Stripe session ID, try to trigger verification
        if (i === 0 && stripeSessionId) {
          console.log('Attempting to trigger webhook manually with session ID:', stripeSessionId);
          
          try {
            // Call an endpoint to check the status directly (if you have one)
            // This is optional and depends on your setup
          } catch (webhookError) {
            console.error('Manual webhook check failed:', webhookError);
            // Continue with retry process even if this fails
          }
        }

        // If not found or not purchased, wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error('Error verifying purchase:', error);
        // Continue retrying despite errors
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log('Purchase verification failed after maximum retries');
  } catch (error) {
    console.error('Session error:', error);
  }
  return null;
};
