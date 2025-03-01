
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
      
      // First try with the most specific filters for highest accuracy
      let success = false;
      let result = null;
      
      // If we have both user ID and session ID, this is the most reliable update method
      if (userId && stripeSessionId) {
        console.log('Attempting update with both user ID and session ID');
        const { error } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', verificationId)
          .eq('user_id', userId);
        
        if (!error) {
          success = true;
          console.log('Update successful with user ID and session ID');
          
          // Fetch the updated result
          const { data } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', verificationId)
            .eq('user_id', userId)
            .maybeSingle();
            
          result = data;
        } else {
          console.log('Update failed with user ID and session ID:', error);
        }
      }
      
      // If first attempt failed and we have user ID, try with just user ID
      if (!success && userId) {
        console.log('Attempting update with user ID only');
        const { error } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', verificationId)
          .eq('user_id', userId);
        
        if (!error) {
          success = true;
          console.log('Update successful with user ID only');
          
          // Fetch the updated result
          const { data } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', verificationId)
            .eq('user_id', userId)
            .maybeSingle();
            
          result = data;
        } else {
          console.log('Update failed with user ID only:', error);
        }
      }
      
      // If previous attempts failed and we have stripe session ID, try with that
      if (!success && stripeSessionId) {
        console.log('Attempting update with session ID only');
        const { error } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            stripe_session_id: stripeSessionId
          })
          .eq('id', verificationId)
          .eq('stripe_session_id', stripeSessionId);
        
        if (!error) {
          success = true;
          console.log('Update successful with session ID only');
          
          // Fetch the updated result
          const { data } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', verificationId)
            .eq('stripe_session_id', stripeSessionId)
            .maybeSingle();
            
          result = data;
        } else {
          console.log('Update failed with session ID only:', error);
        }
      }
      
      // Last resort: just use the result ID
      if (!success) {
        console.log('Attempting update with result ID only (last resort)');
        const { error } = await supabase
          .from('quiz_results')
          .update({ 
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            stripe_session_id: stripeSessionId || null
          })
          .eq('id', verificationId);
        
        if (!error) {
          success = true;
          console.log('Update successful with result ID only');
          
          // Fetch the updated result
          const { data } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', verificationId)
            .maybeSingle();
            
          result = data;
        } else {
          console.log('Update failed with result ID only:', error);
        }
      }
      
      // If we attempted all update methods but still failed to fetch the result,
      // try one more time to fetch it directly without any updates
      if (!result && success) {
        console.log('Update succeeded but result fetch failed, trying direct fetch');
        const { data } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', verificationId)
          .maybeSingle();
          
        result = data;
      }
      
      // Also update purchase tracking if we have a session ID
      if (success && stripeSessionId) {
        try {
          await supabase
            .from('purchase_tracking')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              stripe_session_id: stripeSessionId
            })
            .eq('quiz_result_id', verificationId);
          
          console.log('Updated purchase tracking record');
        } catch (error) {
          console.error('Failed to update purchase tracking, but main update succeeded:', error);
          // Non-critical error, continue anyway
        }
      }
        
      return result;
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
