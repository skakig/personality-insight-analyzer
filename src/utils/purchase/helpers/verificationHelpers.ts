
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../purchaseStatus";

/**
 * Checks if a result is already purchased through direct database query
 */
export const checkDirectPurchaseStatus = async (resultId: string) => {
  try {
    const { data: directResult } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();

    if (directResult && isPurchased(directResult)) {
      console.log('Purchase already verified via direct check');
      return directResult;
    }
    
    return null;
  } catch (error) {
    console.error('Error in direct purchase check:', error);
    return null;
  }
};

/**
 * Helper to log verification parameters for debugging
 */
export const logVerificationParameters = (params: {
  resultId: string,
  userId?: string | null,
  trackingId?: string | null,
  sessionId?: string | null,
  guestToken?: string | null,
  guestEmail?: string | null,
  urlSuccess?: boolean,
  maxRetries?: number,
  delayMs?: number
}) => {
  console.log('Starting purchase verification:', { 
    resultId: params.resultId, 
    userId: params.userId || 'guest',
    hasTrackingId: !!params.trackingId,
    hasGuestToken: !!params.guestToken,
    hasStripeSession: !!params.sessionId,
    hasGuestEmail: !!params.guestEmail,
    urlSuccess: params.urlSuccess,
    maxRetries: params.maxRetries || 5, 
    delayMs: params.delayMs || 1000 
  });
};
