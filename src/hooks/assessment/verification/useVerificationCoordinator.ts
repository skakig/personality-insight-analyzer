
import { useStandardVerification } from "./useStandardVerification";
import { useStripeReturnHandler } from "./useStripeReturnHandler";
import { useFallbackVerificationStrategies } from "./useFallbackVerificationStrategies";

/**
 * Coordinates the verification flow by delegating to specialized hooks
 */
export const useVerificationCoordinator = () => {
  const { executeStandardVerification } = useStandardVerification();
  const { handleStripeReturn } = useStripeReturnHandler();
  const { executeFallbackVerification } = useFallbackVerificationStrategies();
  
  /**
   * Main verification flow coordinator
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
    }
  ) => {
    const { userId, stripeSessionId, isPostPurchase, storedResultId, maxRetries } = options;
    const { verificationAttempts, startVerification, stopVerification } = verificationState;
    
    // Start verification process
    startVerification();
    
    try {
      console.log('Verification coordinator started');
      
      // If we're coming back from Stripe, handle that first
      if (isPostPurchase && stripeSessionId) {
        console.log('Handling Stripe return case');
        const stripeResult = await handleStripeReturn(id, stripeSessionId, userId);
        if (stripeResult) {
          console.log('Stripe return verification successful');
          stopVerification();
          return stripeResult;
        }
      }
      
      // Try standard verification
      console.log('Executing standard verification');
      const standardResult = await executeStandardVerification(id, userId, stripeSessionId, maxRetries);
      if (standardResult) {
        console.log('Standard verification successful');
        stopVerification();
        return standardResult;
      }
      
      // As a last resort, try fallback verification
      if (verificationAttempts >= maxRetries) {
        console.log('Executing fallback verification after max retries');
        const fallbackResult = await executeFallbackVerification(id);
        if (fallbackResult) {
          console.log('Fallback verification successful');
          stopVerification();
          return fallbackResult;
        }
      }
      
      console.log('All verification strategies failed');
      stopVerification();
      return null;
    } catch (error) {
      console.error('Verification coordinator error:', error);
      stopVerification();
      throw error;
    }
  };
  
  return {
    executeVerificationFlow
  };
};
