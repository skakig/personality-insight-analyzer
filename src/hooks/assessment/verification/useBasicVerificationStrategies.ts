import { supabase } from "@/integrations/supabase/client";
import { isPurchased, shouldAllowAccess } from "@/utils/purchaseStatus";
import { getStoredPurchaseData } from "@/utils/purchaseStateUtils";
import { updateResultWithPurchase } from "@/utils/purchaseVerification";
import { useState, useCallback } from "react";

export const useBasicVerificationStrategies = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyWithUserId = useCallback(async (resultId: string, userId: string) => {
    try {
      console.log('Verifying with user ID:', { resultId, userId });
      
      if (!resultId || !userId) {
        console.error('Missing parameters for user verification:', { resultId, userId });
        return null;
      }
      
      setIsVerifying(true);
      
      // Fetch the result with user ID
      const { data: result, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching result with user ID:', error);
        return null;
      }
      
      if (result && shouldAllowAccess(result)) {
        console.log('Result verified with user ID');
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error in user ID verification:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const verifyWithGuestToken = useCallback(async (resultId: string, guestToken: string) => {
    try {
      console.log('Verifying with guest token:', { resultId, guestToken });
      
      if (!resultId || !guestToken) {
        console.error('Missing parameters for guest token verification:', { resultId, guestToken });
        return null;
      }
      
      setIsVerifying(true);
      
      // Fetch the result with guest token
      const { data: result, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_access_token', guestToken)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching result with guest token:', error);
        return null;
      }
      
      if (result && shouldAllowAccess(result)) {
        console.log('Result verified with guest token');
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error in guest token verification:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const verifyWithGuestEmail = useCallback(async (resultId: string, guestEmail: string) => {
    try {
      console.log('Verifying with guest email:', { resultId, guestEmail });
      
      if (!resultId || !guestEmail) {
        console.error('Missing parameters for guest email verification:', { resultId, guestEmail });
        return null;
      }
      
      setIsVerifying(true);
      
      // Fetch the result with guest email
      const { data: result, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('guest_email', guestEmail)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching result with guest email:', error);
        return null;
      }
      
      if (result && shouldAllowAccess(result)) {
        console.log('Result verified with guest email');
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error in guest email verification:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const verifyWithStripeSession = useCallback(async (resultId: string, sessionId: string) => {
    try {
      console.log('Verifying with Stripe session:', { resultId, sessionId });
      
      if (!resultId || !sessionId) {
        console.error('Missing parameters for session verification:', { resultId, sessionId });
        return null;
      }
      
      setIsVerifying(true);
      
      // First check if the result already exists with this session ID
      const { data: existingResult, error: existingError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
        
      if (existingError) {
        console.error('Error fetching existing result:', existingError);
      } else if (existingResult && isPurchased(existingResult)) {
        console.log('Result already verified with session ID');
        return existingResult;
      }
      
      // Try to update the result with purchase information
      const updated = await updateResultWithPurchase(resultId, sessionId);
      
      if (updated) {
        // Fetch the updated result
        const { data: updatedResult, error: updatedError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId)
          .maybeSingle();
          
        if (updatedError) {
          console.error('Error fetching updated result:', updatedError);
        } else if (updatedResult && isPurchased(updatedResult)) {
          console.log('Result verified with session ID after update');
          return updatedResult;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in session verification:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const executeBasicVerificationStrategies = useCallback(async (resultId: string) => {
    try {
      console.log('Executing basic verification strategies for result:', resultId);
      
      if (!resultId) {
        console.error('Missing result ID for verification');
        return null;
      }
      
      // Get stored data from localStorage
      const { 
        userId, 
        guestAccessToken, 
        stripeSessionId, 
        guestEmail 
      } = getStoredPurchaseData();
      
      // Try verification with user ID if available
      if (userId) {
        const userResult = await verifyWithUserId(resultId, userId);
        if (userResult) return userResult;
      }
      
      // Try verification with guest token if available
      if (guestAccessToken) {
        const tokenResult = await verifyWithGuestToken(resultId, guestAccessToken);
        if (tokenResult) return tokenResult;
      }
      
      // Try verification with session ID if available
      if (stripeSessionId) {
        const sessionResult = await verifyWithStripeSession(resultId, stripeSessionId);
        if (sessionResult) return sessionResult;
      }
      
      // Try verification with guest email if available
      if (guestEmail) {
        const emailResult = await verifyWithGuestEmail(resultId, guestEmail);
        if (emailResult) return emailResult;
      }
      
      return null;
    } catch (error) {
      console.error('Error executing basic verification strategies:', error);
      return null;
    }
  }, [verifyWithUserId, verifyWithGuestToken, verifyWithStripeSession, verifyWithGuestEmail]);

  return {
    isVerifying,
    verifyWithUserId,
    verifyWithGuestToken,
    verifyWithGuestEmail,
    verifyWithStripeSession,
    executeBasicVerificationStrategies
  };
};
