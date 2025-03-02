
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useStripeReturnHandler } from "./useStripeReturnHandler";
import { useVerificationFlowProcessor } from "./useVerificationFlowProcessor";

/**
 * Coordinates the verification flow processes
 */
export const useVerificationCoordinator = () => {
  const { handleStripeReturn } = useStripeReturnHandler();
  const { attemptDirectUpdate, handleMaxRetriesExceeded } = useVerificationFlowProcessor();

  /**
   * Execute the verification flow for a purchase
   */
  const executeVerificationFlow = async (
    id: string | undefined, 
    options: {
      userId?: string;
      stripeSessionId?: string;
      isPostPurchase: boolean;
      storedResultId?: string;
      maxRetries: number;
    },
    verificationState: {
      verificationAttempts: number;
      startVerification: () => void;
      stopVerification: () => void;
    },
    handlers: {
      setResult: (result: any) => void;
      setLoading: (loading: boolean) => void;
      verifyPurchase: (id: string) => Promise<boolean>;
    }
  ) => {
    const { userId, stripeSessionId, isPostPurchase, storedResultId, maxRetries } = options;
    const { verificationAttempts, startVerification, stopVerification } = verificationState;
    const { setResult, setLoading, verifyPurchase } = handlers;
    
    console.log('Initiating purchase verification flow', {
      id,
      userId,
      stripeSessionId,
      isPostPurchase,
      verificationAttempts
    });
    
    const verificationId = id || storedResultId;
    
    if (!verificationId) {
      console.error('No result ID available for verification');
      toast({
        title: "Verification Error",
        description: "Missing result ID. Please try accessing your report from the dashboard.",
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }
    
    // First, try to handle direct return from Stripe
    if (isPostPurchase || stripeSessionId) {
      try {
        const stripeReturnResult = await handleStripeReturn(verificationId, {
          userId, 
          sessionId: stripeSessionId
        });
        
        if (stripeReturnResult) {
          console.log('Successfully processed Stripe return directly');
          setResult(stripeReturnResult);
          setLoading(false);
          return stripeReturnResult;
        }
      } catch (error) {
        console.error('Error handling Stripe return:', error);
        // Continue to next strategy
      }
    }
    
    // For logged-in users, attempt direct update
    if (userId) {
      try {
        console.log('Attempting direct database update for logged-in user');
        
        const directResult = await attemptDirectUpdate(
          verificationId, 
          userId,
          stripeSessionId
        );
        
        if (directResult) {
          setResult(directResult);
          setLoading(false);
          stopVerification();
          return directResult;
        }
      } catch (error) {
        console.error('Error during direct update:', error);
        // Continue to next strategy
      }
    }
    
    // Maximum retries check
    if (verificationAttempts >= maxRetries) {
      try {
        return await handleMaxRetriesExceeded(verificationId, {
          stripeSessionId,
          userId
        });
      } catch (error) {
        console.error('Error handling max retries:', error);
        // Continue to next strategy
      }
    }
    
    // Standard verification attempt
    try {
      let success = await verifyPurchase(verificationId);
      
      // If first attempt fails and this is directly after purchase, try again
      if (!success && isPostPurchase) {
        console.log('First attempt failed, trying again after short delay');
        await new Promise(resolve => setTimeout(resolve, 1500));
        success = await verifyPurchase(verificationId);
      }
      
      // If verification failed, use fallback methods
      if (!success) {
        toast({
          title: "Verification in progress",
          description: "We're still processing your purchase. Please wait a moment...",
        });
        
        try {
          console.log('Attempting final direct database update as fallback');
          const finalResult = await attemptDirectUpdate(
            verificationId,
            userId,
            stripeSessionId
          );
          
          if (finalResult) {
            console.log('Final direct database update successful!');
            setResult(finalResult);
            setLoading(false);
            stopVerification();
            return finalResult;
          }
        } catch (finalError) {
          console.error('Final fallback attempt failed:', finalError);
        }
      }
    } catch (error) {
      console.error('Error during verification process:', error);
    }
    
    return null;
  };

  return {
    executeVerificationFlow
  };
};
