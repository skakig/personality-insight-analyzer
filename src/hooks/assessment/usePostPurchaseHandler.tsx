
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

  const attemptDirectUpdate = async (options: {
    stripeSessionId: string;
    isPostPurchase: boolean;
    verificationId: string;
    userId?: string;
  }) => {
    const { stripeSessionId, isPostPurchase, verificationId, userId } = options;
    
    if (!isPostPurchase || !verificationId) {
      console.log('Direct update skipped - not a post-purchase state or missing verification ID');
      return null;
    }
    
    try {
      console.log('Attempting direct database update for verification', {
        verificationId,
        userId,
        hasSessionId: !!stripeSessionId,
        isPostPurchase
      });
      
      // Create the base query
      let query = supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString(),
          access_method: 'purchase'
        })
        .eq('id', verificationId);
        
      // For logged-in users, add the user_id filter to ensure we're updating the correct record
      if (userId) {
        console.log('Adding user ID filter to update query', userId);
        query = query.eq('user_id', userId);
      } 
      // For guest users or as a fallback, try with session ID
      else if (stripeSessionId) {
        console.log('Adding session ID filter to update query', stripeSessionId);
        query = query.eq('stripe_session_id', stripeSessionId);
      }
      
      const { error: updateError } = await query;
      
      if (updateError) {
        console.error('Direct update failed with filters:', updateError);
        
        // If the filtered update failed, try once more without filters as last resort
        if ((userId || stripeSessionId) && isPostPurchase) {
          console.log('Attempting final direct update without filters');
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
        }
      } else {
        console.log('Direct update successful for verification ID', verificationId);
      }
        
      // Fetch the updated result once more
      let resultQuery = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', verificationId);
        
      // Add user filter for logged-in users
      if (userId) {
        resultQuery = resultQuery.eq('user_id', userId);
      }
      
      const { data: finalResult } = await resultQuery.maybeSingle();
        
      return finalResult;
    } catch (error) {
      console.error('Final manual update failed:', error);
    }
    
    return null;
  };

  return {
    handleVerificationFailure,
    attemptDirectUpdate
  };
};
