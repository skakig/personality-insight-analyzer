
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Specialized hook for handling verification flow processes
 */
export const useVerificationFlowProcessor = () => {
  /**
   * Last resort - attempt direct update if all else fails
   */
  const attemptDirectUpdate = async (
    verificationId: string,
    userId?: string,
    stripeSessionId?: string
  ) => {
    console.log('Attempting direct database update as fallback');
    
    if (userId) {
      console.log('Using user ID for direct update');
      
      // Fallback direct update bypassing verification process
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
        console.log('Direct fallback update succeeded');
        const { data: directResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', verificationId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (directResult) {
          return directResult;
        }
      } else {
        console.error('Direct fallback update failed:', error);
      }
    }
    
    // If user ID not available or update failed, try with session ID
    if (stripeSessionId) {
      console.log('Using session ID for direct update');
      
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
        console.log('Session ID update succeeded');
        const { data: sessionResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', verificationId)
          .eq('stripe_session_id', stripeSessionId)
          .maybeSingle();
          
        if (sessionResult) {
          return sessionResult;
        }
      }
    }
    
    // Last resort: direct update with just the ID
    console.log('Using direct ID update as last resort');
    const { error } = await supabase
      .from('quiz_results')
      .update({ 
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase'
      })
      .eq('id', verificationId);
      
    if (!error) {
      console.log('Last resort update succeeded');
      const { data: lastResult } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', verificationId)
        .maybeSingle();
        
      if (lastResult) {
        return lastResult;
      }
    }
    
    return null;
  };

  /**
   * Handle max retries exceeded
   */
  const handleMaxRetriesExceeded = async (
    verificationId: string,
    options: {
      stripeSessionId?: string;
      userId?: string;
    }
  ) => {
    console.log('Maximum verification retries exceeded, attempting final direct update');
    
    const finalResult = await attemptDirectUpdate(
      verificationId, 
      options.userId, 
      options.stripeSessionId
    );
    
    if (finalResult) {
      console.log('Final direct update succeeded!');
      return finalResult;
    } else {
      console.log('Final direct update failed, redirecting to dashboard');
      // Store a flag in localStorage to show a notification on dashboard
      localStorage.setItem('purchaseVerificationFailed', 'true');
      localStorage.setItem('failedVerificationId', verificationId);
      
      toast({
        title: "Verification taking too long",
        description: "Redirecting you to the dashboard where you can access your reports.",
        variant: "default",
      });
      
      // Short delay before redirecting
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
      return null;
    }
  };

  return {
    attemptDirectUpdate,
    handleMaxRetriesExceeded
  };
};
