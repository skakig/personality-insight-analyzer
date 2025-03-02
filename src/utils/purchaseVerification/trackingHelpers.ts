
import { supabase } from "@/integrations/supabase/client";

/**
 * Finds and updates a purchase tracking record 
 */
export const findAndUpdateTrackingRecord = async (stripeSessionId: string) => {
  try {
    if (!stripeSessionId) {
      console.error('Missing session ID for tracking record lookup');
      return null;
    }
    
    console.log('Looking for tracking record with session ID:', stripeSessionId);
    
    try {
      // First check if the record exists
      const { data: trackingData, error: trackingError } = await supabase
        .from('purchase_tracking')
        .select('*')
        .eq('stripe_session_id', stripeSessionId)
        .maybeSingle();
      
      if (trackingError) {
        if (trackingError.message?.includes('infinite recursion') || 
            trackingError.message?.includes('policy for relation')) {
          console.error('Database policy error in tracking lookup:', trackingError);
          throw new Error('Database access policy error');
        } else {
          console.error('Error finding tracking record:', trackingError);
          return null;
        }
      }
      
      // If the record exists but isn't completed, update it
      if (trackingData && trackingData.status !== 'completed') {
        try {
          const { error: updateError } = await supabase
            .from('purchase_tracking')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', trackingData.id);
          
          if (updateError) {
            console.error('Error updating tracking record:', updateError);
          } else {
            console.log('Successfully updated tracking record to completed');
          }
        } catch (updateError) {
          console.error('Exception during tracking record update:', updateError);
        }
      }
      
      return trackingData;
    } catch (error) {
      console.error('Error in tracking record lookup:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in findAndUpdateTrackingRecord:', error);
    return null;
  }
};
