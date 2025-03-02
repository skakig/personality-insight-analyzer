
/**
 * Re-exports purchase utility functions from modular files
 */

import { supabase } from "@/integrations/supabase/client";
export { isPurchased, isPending, shouldAllowAccess, shouldShowPurchaseOptions, hasAnyPurchasedReport } from './purchaseStatus';
export { 
  checkPurchaseTracking, 
  updateResultWithPurchase, 
  manuallyCheckStripeSession 
} from './purchaseVerification';

// Add the missing function export with enhanced logging
export const verifyPurchaseWithRetry = async (resultId: string, maxRetries = 5) => {
  console.log(`[DEBUG] Starting purchase verification with retries for result: ${resultId}`);
  
  try {
    // Check URL parameters for direct verification info
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    console.log(`[DEBUG] URL parameters: success=${success}, session_id=${sessionId ? sessionId.substring(0, 10) + '...' : 'null'}`);
    
    // Store session ID from URL if available
    if (sessionId) {
      console.log(`[DEBUG] Storing session ID from URL: ${sessionId.substring(0, 10)}...`);
      localStorage.setItem('stripeSessionId', sessionId);
    }
    
    // Dynamic import to avoid circular dependencies
    const { executeVerification } = await import('./purchase/verification');
    
    const result = await executeVerification(resultId, maxRetries);
    
    if (result) {
      console.log('[DEBUG] Verification successful:', {
        resultId: result.id,
        isPurchased: result.is_purchased,
        purchaseStatus: result.purchase_status,
        accessMethod: result.access_method
      });
    } else {
      console.log('[DEBUG] Verification failed, no result returned');
    }
    
    return result;
  } catch (error) {
    console.error('[ERROR] Error in verifyPurchaseWithRetry:', error);
    return null;
  }
};

/**
 * Send results email for a purchase
 */
export const sendResultsEmail = async (email: string, resultId: string) => {
  console.log(`[DEBUG] Sending results email to ${email} for result ${resultId}`);
  
  try {
    const { error } = await supabase.functions.invoke('send-results', {
      body: { email, resultId }
    });
    
    if (error) {
      console.error('[ERROR] Failed to send results email:', error);
      return false;
    }
    
    console.log('[DEBUG] Results email sent successfully');
    return true;
  } catch (error) {
    console.error('[ERROR] Error sending results email:', error);
    return false;
  }
};
