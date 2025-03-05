
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to find and update a purchase tracking record by session ID
 */
export const findAndUpdateTrackingRecord = async (stripeSessionId: string) => {
  try {
    if (!stripeSessionId) {
      console.log('Missing session ID for tracking lookup');
      return null;
    }
    
    console.log('Looking up tracking record for session ID:', stripeSessionId);
    
    const { data: trackingData, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (trackingError) {
      console.error('Error fetching tracking record:', trackingError);
      return null;
    }
    
    if (!trackingData) {
      console.log('No tracking record found for session ID:', stripeSessionId);
      return null;
    }
    
    console.log('Found tracking record:', trackingData);
    
    // Update tracking status if needed
    if (trackingData.status !== 'completed') {
      await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', trackingData.id);
      
      console.log('Updated tracking record status to completed');
    }
    
    // Store guest email if available
    if (trackingData.guest_email) {
      localStorage.setItem('guestEmail', trackingData.guest_email);
    }
    
    return trackingData;
  } catch (error) {
    console.error('Error processing tracking record:', error);
    return null;
  }
};
