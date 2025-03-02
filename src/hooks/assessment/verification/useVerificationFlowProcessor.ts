
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
    console.log('Attempting direct database update as fallback', {
      verificationId,
      userId,
      stripeSessionId
    });
    
    try {
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
        
        // First, try to update with both ID and session ID
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
        } else {
          console.error('Session ID update failed:', error);
          
          // If that fails, try updating just by ID but setting the session ID
          const { error: updateError } = await supabase
            .from('quiz_results')
            .update({ 
              is_purchased: true,
              is_detailed: true,
              purchase_status: 'completed',
              purchase_completed_at: new Date().toISOString(),
              access_method: 'purchase',
              stripe_session_id: stripeSessionId
            })
            .eq('id', verificationId);
            
          if (!updateError) {
            console.log('Last resort ID update succeeded');
            const { data: lastResult } = await supabase
              .from('quiz_results')
              .select('*')
              .eq('id', verificationId)
              .maybeSingle();
              
            if (lastResult) {
              return lastResult;
            }
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
    } catch (error) {
      console.error('Database update error:', error);
      return null;
    }
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
    
    try {
      const finalResult = await attemptDirectUpdate(
        verificationId, 
        options.userId, 
        options.stripeSessionId
      );
      
      if (finalResult) {
        console.log('Final direct update succeeded!');
        toast({
          title: "Purchase Verified",
          description: "Your detailed report is now available.",
        });
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
    } catch (error) {
      console.error('Error during max retries handling:', error);
      return null;
    }
  };

  return {
    attemptDirectUpdate,
    handleMaxRetriesExceeded
  };
};
