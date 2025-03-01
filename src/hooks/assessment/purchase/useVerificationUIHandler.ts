
import React from "react";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

/**
 * Handles UI-related functionality for verification processes
 */
export const useVerificationUIHandler = () => {
  /**
   * Shows appropriate verification failure UI message based on attempt count
   */
  const handleVerificationFailure = (verificationAttempts: number) => {
    // Show appropriate message based on verification attempts
    if (verificationAttempts > 0) {
      toast({
        title: "Purchase verification delayed",
        description: "Your purchase may take a few moments to process. You can refresh the page or check your dashboard.",
        variant: "default",
        action: (
          <ToastAction 
            altText="Refresh the page"
            onClick={() => window.location.reload()}
          >
            Refresh
          </ToastAction>
        )
      });
    } else {
      toast({
        title: "Verification in progress",
        description: "We're still processing your purchase. Please wait a moment...",
      });
    }
  };

  /**
   * Shows success toast for verified purchase
   */
  const showVerificationSuccess = () => {
    toast({
      title: "Purchase verified!",
      description: "Your detailed report is now available.",
    });
  };

  return {
    handleVerificationFailure,
    showVerificationSuccess
  };
};
