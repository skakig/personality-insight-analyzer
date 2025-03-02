
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { executeVerification } from "@/utils/purchase/verificationCore";

export const useVerificationCoordinator = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Run primary verification flow
  const runVerification = async (id: string, sessionId?: string, userId?: string) => {
    if (!id) return false;
    
    try {
      setIsVerifying(true);
      setVerificationComplete(false);
      setVerificationSuccess(false);
      
      console.log('Running coordinated verification for:', id);
      
      const verifiedResult = await executeVerification(id);
      
      if (verifiedResult) {
        setVerificationSuccess(true);
        setVerificationComplete(true);
        return true;
      }
      
      setVerificationComplete(true);
      return false;
    } catch (error) {
      console.error('Verification coordination error:', error);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Fallback verification when other methods fail
  const runFallbackVerification = async (id: string) => {
    if (!id) return false;
    
    try {
      setIsVerifying(true);
      
      // Just make a direct database check/update
      const { data, error } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'fallback'
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      setVerificationSuccess(true);
      setVerificationComplete(true);
      return true;
    } catch (error) {
      console.error('Fallback verification error:', error);
      setVerificationComplete(true);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verificationComplete,
    verificationSuccess,
    runVerification,
    runFallbackVerification
  };
};
