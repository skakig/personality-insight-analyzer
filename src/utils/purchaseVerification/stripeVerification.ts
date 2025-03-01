
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { updateResultWithPurchase } from "./resultUpdates";
import { findAndUpdateTrackingRecord } from "./trackingHelpers";
import { 
  verifyResultWithSessionId, 
  fetchResultBySessionId,
  findAnyResultBySessionId 
} from "./resultVerification";
import { updateResultWithSessionId } from "./databaseUpdates";

/**
 * Helper function to verify purchase using only session ID
 */
export const manuallyVerifyWithSessionId = async (stripeSessionId: string, resultId: string) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for manual verification:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Manually verifying with session ID:', { stripeSessionId, resultId });
    
    // Check for tracking record and update if needed
    await findAndUpdateTrackingRecord(stripeSessionId);
    
    // Verify the result with session ID
    return await verifyResultWithSessionId(stripeSessionId, resultId);
  } catch (error) {
    console.error('Error in manual session verification:', error);
    return null;
  }
};

/**
 * Manually checks and updates purchase status using stripe session
 */
export const manuallyCheckStripeSession = async (stripeSessionId: string, resultId: string, queryBuilder: any) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for stripe session check:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Manually checking Stripe session:', stripeSessionId);
    
    // Check if the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // First check if result already exists with session ID and is purchased
    const existingResult = await fetchResultBySessionId(resultId, stripeSessionId);
    if (existingResult) {
      console.log('Purchase already verified via session ID match');
      return existingResult;
    }
    
    // Check if purchase_tracking has been completed for this session
    const trackingData = await findAndUpdateTrackingRecord(stripeSessionId);
    
    if (trackingData) {
      // Update the result with purchase information
      const updated = await updateResultWithSessionId(resultId, stripeSessionId, userId);
      
      if (updated) {
        // Fetch the updated result
        const { data: updatedResult, error: resultError } = await queryBuilder.maybeSingle();
        
        if (resultError) {
          console.error('Failed to fetch updated result:', resultError);
        } else if (updatedResult && isPurchased(updatedResult)) {
          console.log('Manual update successful via tracking record!');
          return updatedResult;
        }
      }
    }
    
    // If no tracking record was found, try direct update
    const directUpdate = await updateResultWithPurchase(resultId, stripeSessionId);
    
    if (directUpdate) {
      const { data: directResult } = await queryBuilder.maybeSingle();
      
      if (directResult && isPurchased(directResult)) {
        console.log('Direct update successful!');
        return directResult;
      }
    }
    
    // Last resort: Try to find any result with this session ID
    const anyResult = await findAnyResultBySessionId(stripeSessionId);
    if (anyResult && anyResult.id === resultId && isPurchased(anyResult)) {
      console.log('Found result via session ID only');
      return anyResult;
    }
    
    return null;
  } catch (error) {
    console.error('Manual stripe session check failed:', error);
    return null;
  }
};
