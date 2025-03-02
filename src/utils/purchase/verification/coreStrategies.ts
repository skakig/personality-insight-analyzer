
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../../purchaseStatus";
import { 
  verifyWithUserId,
  verifyWithGuestToken, 
  verifyWithGuestEmail,
  verifyWithStripeSession,
  forceUpdatePurchaseStatus
} from './baseStrategies';

/**
 * Execute immediate verification strategies
 */
export const executeImmediateVerificationStrategies = async (
  resultId: string,
  userId?: string | null,
  trackingId?: string | null,
  sessionId?: string | null,
  guestToken?: string | null,
  guestEmail?: string | null
) => {
  console.log('Executing immediate verification strategies');
  
  // Check if the result is already purchased
  const { data: directResult } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', resultId)
    .maybeSingle();
    
  if (directResult && isPurchased(directResult)) {
    console.log('Result already purchased');
    return directResult;
  }
  
  // Try verification with user ID
  if (userId) {
    console.log('Checking user ID:', userId);
    const userResult = await verifyWithUserId(resultId, userId);
    if (userResult) {
      console.log('Verified via user ID');
      return userResult;
    }
  }
  
  // Try verification with Stripe session ID
  if (sessionId) {
    console.log('Checking session ID:', sessionId);
    const sessionResult = await verifyWithStripeSession(resultId, sessionId);
    if (sessionResult) {
      console.log('Verified via session ID');
      return sessionResult;
    }
  }
  
  // Try verification with guest token
  if (guestToken) {
    console.log('Checking guest token');
    const tokenResult = await verifyWithGuestToken(resultId, guestToken);
    if (tokenResult) {
      console.log('Verified via guest token');
      return tokenResult;
    }
  }
  
  // Try verification with guest email
  if (guestEmail) {
    console.log('Checking guest email:', guestEmail);
    const emailResult = await verifyWithGuestEmail(resultId, guestEmail);
    if (emailResult) {
      console.log('Verified via guest email');
      return emailResult;
    }
  }
  
  console.log('All immediate verification strategies failed');
  return null;
};

/**
 * Execute retry-based verification strategies
 */
export const executeRetryVerificationStrategies = async (
  resultId: string,
  maxRetries: number,
  delayMs: number,
  userId?: string | null,
  trackingId?: string | null,
  sessionId?: string | null,
  guestToken?: string | null,
  guestEmail?: string | null
) => {
  console.log('Executing retry-based verification strategies');
  
  let retries = 0;
  while (retries < maxRetries) {
    retries++;
    console.log(`Verification retry ${retries}/${maxRetries}`);
    
    // Wait before trying again
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // Try the immediate strategies again
    const result = await executeImmediateVerificationStrategies(
      resultId,
      userId,
      trackingId,
      sessionId,
      guestToken,
      guestEmail
    );
    
    if (result) {
      console.log('Verified on retry:', retries);
      return result;
    }
  }
  
  console.log('All retry verification strategies failed');
  return null;
};

/**
 * Execute fallback verification as last resort
 */
export const executeFallbackVerification = async (resultId: string) => {
  console.log('Executing fallback verification strategy');
  
  // Last resort: direct update without any filters
  return await forceUpdatePurchaseStatus(resultId);
};
