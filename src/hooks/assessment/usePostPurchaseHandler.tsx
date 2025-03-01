
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

/**
 * Handles post-purchase verification and error handling
 */
export const usePostPurchaseHandler = () => {
  const handleVerificationFailure = (verificationAttempts: number) => {
    // Show appropriate message based on verification attempts
    if (verificationAttempts > 0) {
      toast({
        title: "Purchase verification delayed",
        description: "Your purchase may take a few moments to process. You can refresh the page or check your dashboard.",
        variant: "default",
        action: (
          <ToastAction 
            altText="Refresh" 
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

  const attemptDirectUpdate = async (options: {
    stripeSessionId: string;
    isPostPurchase: boolean;
    verificationId: string;
  }) => {
    const { stripeSessionId, isPostPurchase, verificationId } = options;
    
    if (stripeSessionId && isPostPurchase && verificationId) {
      try {
        await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', verificationId);
          
        // Fetch the updated result once more
        const { data: finalResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', verificationId)
          .maybeSingle();
          
        return finalResult;
      } catch (error) {
        console.error('Final manual update failed:', error);
      }
    }
    
    return null;
  };

  return {
    handleVerificationFailure,
    attemptDirectUpdate
  };
};
