
import { useVerificationUIHandler } from "./purchase/useVerificationUIHandler";
import { useDatabaseVerification } from "./purchase/useDatabaseVerification";

/**
 * Handles post-purchase verification and error handling
 */
export const usePostPurchaseHandler = () => {
  const { handleVerificationFailure } = useVerificationUIHandler();
  const { attemptDirectUpdate } = useDatabaseVerification();

  return {
    handleVerificationFailure,
    attemptDirectUpdate
  };
};
