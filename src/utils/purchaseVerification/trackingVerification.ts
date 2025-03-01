
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { manuallyVerifyWithSessionId } from "./stripeVerification";
import { updateResultWithPurchase } from "./resultUpdates";

/**
 * Checks purchase tracking status and returns the result if verified
 */
export const checkPurchaseTracking = async (trackingId: string, resultId: string) => {
  try {
    const { data: tracking, error } = await supabase
      .from('purchase_tracking')
      .select('status, completed_at, guest_email, stripe_session_id')
      .eq('id', trackingId)
      .maybeSingle();
    
    if (error) {
      console.error('Failed to check purchase tracking:', error);
      return null;
    }
      
    if (tracking?.status === 'completed') {
      console.log('Purchase verified via tracking record');
      
      // If tracking has guest email, store it
      if (tracking.guest_email) {
        localStorage.setItem('guestEmail', tracking.guest_email);
      }
      
      // If tracking is complete, fetch the result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (resultError) {
        console.error('Failed to fetch quiz result:', resultError);
        return null;
      }
        
      if (result && isPurchased(result)) {
        return result;
      }
      
      // If result exists but isn't marked as purchased, try to update it
      if (result && tracking.stripe_session_id) {
        const updated = await updateResultWithPurchase(resultId, tracking.stripe_session_id);
        if (updated) {
          const { data: updatedResult } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', resultId)
            .maybeSingle();
            
          if (updatedResult && isPurchased(updatedResult)) {
            return updatedResult;
          }
        }
      }
    } else if (tracking?.stripe_session_id) {
      // Even if tracking isn't completed, try to use the session ID to verify
      return await manuallyVerifyWithSessionId(tracking.stripe_session_id, resultId);
    }
  } catch (error) {
    console.error('Error checking purchase tracking:', error);
  }
  
  return null;
};
