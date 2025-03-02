
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export const useLoggedInCheckout = (quizResultId: string | null, couponCode?: string | null) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!quizResultId) {
      console.error('No quiz result ID provided for checkout');
      toast({
        title: "Error",
        description: "Missing result information. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Initiating checkout for logged-in user with result:', quizResultId);

    try {
      // Get the current user session to ensure we're logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Please log in to complete this purchase');
      }

      // Store newsletter preference
      const newsletterOptIn = localStorage.getItem('newsletterOptIn') === 'true';

      // Create checkout session via Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          resultId: quizResultId,
          couponCode,
          userId: session.user.id,
          email: session.user.email,
          newsletterOptIn,
          metadata: {
            resultId: quizResultId,
            couponCode,
            userId: session.user.id,
            email: session.user.email,
            newsletterOptIn,
            returnUrl: `${window.location.origin}/assessment/${quizResultId}?success=true`
          }
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }

      console.log('Checkout session created successfully:', {
        hasUrl: !!data.url,
        hasSessionId: !!data.sessionId
      });
      
      // Store data for verification on return
      if (data.sessionId) {
        console.log('Storing session data for verification:', {
          resultId: quizResultId,
          sessionId: data.sessionId,
          userId: session.user.id
        });
        
        storePurchaseData(quizResultId, data.sessionId, session.user.id);
        
        // Update quiz result with session ID for tracking
        await supabase
          .from('quiz_results')
          .update({
            stripe_session_id: data.sessionId,
            user_id: session.user.id, // Ensure the result is linked to the user
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(false);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to initiate checkout. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    handleCheckout
  };
};
