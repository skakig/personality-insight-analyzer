
import { supabase } from "@/integrations/supabase/client";

/**
 * Provides utilities for updating purchase tracking records
 */
export const usePurchaseTrackingUpdates = () => {
  /**
   * Update the purchase tracking record with completed status
   */
  const updatePurchaseTracking = async (
    resultId: string,
    sessionId?: string | null
  ) => {
    if (!sessionId) return false;
    
    try {
      await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: sessionId
        })
        .eq('quiz_result_id', resultId);
      
      console.log('Updated purchase tracking record');
      return true;
    } catch (error) {
      console.error('Failed to update purchase tracking:', error);
      return false;
    }
  };
  
  return {
    updatePurchaseTracking
  };
};
