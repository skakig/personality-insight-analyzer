
import { supabase } from "@/integrations/supabase/client";
import { isPurchased } from "../purchaseStatus";
import { updateResultWithPurchase } from "./resultUpdates";

/**
 * Helper function to verify a result using only a session ID
 */
export const verifyResultWithSessionId = async (stripeSessionId: string, resultId: string) => {
  try {
    if (!stripeSessionId || !resultId) {
      console.error('Missing parameters for verification:', { stripeSessionId, resultId });
      return null;
    }
    
    console.log('Verifying result with session ID:', { stripeSessionId, resultId });
    
    // Try to update the result
    const updated = await updateResultWithPurchase(resultId, stripeSessionId);
    
    if (updated) {
      // Fetch the updated result
      const { data: result } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', resultId)
        .maybeSingle();
        
      if (result && isPurchased(result)) {
        console.log('Purchase verified via session ID');
        return result;
      }
    }
  } catch (error) {
    console.error('Error in session verification:', error);
  }
  
  return null;
};

/**
 * Attempts to fetch a result directly by ID and session ID
 */
export const fetchResultBySessionId = async (resultId: string, stripeSessionId: string) => {
  try {
    const { data: result, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching result by session ID:', error);
      return null;
    }
    
    if (result && isPurchased(result)) {
      console.log('Found purchased result by session ID');
      return result;
    }
    
    console.log('Result not found or not purchased by session ID');
    return null;
  } catch (error) {
    console.error('Error in fetchResultBySessionId:', error);
    return null;
  }
};

/**
 * Attempts to find any result associated with the given session ID
 */
export const findAnyResultBySessionId = async (stripeSessionId: string) => {
  try {
    const { data: result, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();
      
    if (error) {
      console.error('Error finding any result by session ID:', error);
      return null;
    }
    
    if (result && isPurchased(result)) {
      console.log('Found purchased result by session ID');
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Error in findAnyResultBySessionId:', error);
    return null;
  }
};
