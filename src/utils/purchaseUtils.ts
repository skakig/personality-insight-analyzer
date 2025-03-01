
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

export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 15, delayMs = 2000) => {
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

    // First try to update the result status if we have a session ID
    // This helps with cases where the webhook hasn't processed yet
    if (stripeSessionId) {
      try {
        console.log('Trying to update result with stripe session ID:', stripeSessionId);
        await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', resultId)
          .eq('stripe_session_id', stripeSessionId);
      } catch (updateError) {
        console.error('Error updating result with session ID:', updateError);
        // Continue with verification even if this fails
      }
    }

    // Try to check tracking status first if we have a tracking ID
    if (trackingId) {
      const { data: tracking } = await supabase
        .from('purchase_tracking')
        .select('status, completed_at')
        .eq('id', trackingId)
        .maybeSingle();
        
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

    // Perform direct verification attempts
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
        
        // If it's purchased, return immediately
        if (result && isPurchased(result)) {
          console.log('Purchase verified successfully on attempt', i + 1);
          return result;
        }

        // If we found a result but it's not marked as purchased yet, let's try to update it
        // This helps in cases where the webhook was processed but the result wasn't updated
        if (result && stripeSessionId && i > 2) {
          console.log('Found result but not purchased. Attempting manual update with session ID:', stripeSessionId);
          
          try {
            await supabase
              .from('quiz_results')
              .update({ 
                is_purchased: true,
                purchase_status: 'completed',
                purchase_completed_at: new Date().toISOString(),
                access_method: 'purchase'
              })
              .eq('id', resultId)
              .eq('stripe_session_id', stripeSessionId);
              
            // Fetch the updated result
            const { data: updatedResult } = await query.maybeSingle();
            if (updatedResult && isPurchased(updatedResult)) {
              console.log('Manual update successful!');
              return updatedResult;
            }
          } catch (updateError) {
            console.error('Manual update failed:', updateError);
            // Continue with retry process
          }
        }

        console.log(`Attempt ${i + 1} failed, result not purchased yet`);

        // If this is the first attempt and we have a Stripe session ID, try to manually verify
        if (i === 0 && stripeSessionId) {
          console.log('Attempting to manually check Stripe session:', stripeSessionId);
          
          try {
            // Check if purchase_tracking has been completed for this session
            const { data: trackingData } = await supabase
              .from('purchase_tracking')
              .select('*')
              .eq('stripe_session_id', stripeSessionId)
              .eq('status', 'completed')
              .maybeSingle();
              
            if (trackingData) {
              console.log('Found completed tracking record:', trackingData);
              
              // Update the result directly
              await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase'
                })
                .eq('id', resultId);
                
              // Fetch the updated result
              const { data: updatedResult } = await query.maybeSingle();
              if (updatedResult && isPurchased(updatedResult)) {
                console.log('Manual update successful via tracking record!');
                return updatedResult;
              }
            }
          } catch (webhookError) {
            console.error('Manual webhook check failed:', webhookError);
            // Continue with retry process
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
