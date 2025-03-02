
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useGuestCheckout = (
  quizResultId: string | null, 
  email: string,
  onSuccess: () => void,
  couponCode?: string | null
) => {
  const [loading, setLoading] = useState(false);

  const handleGuestCheckout = async () => {
    if (!quizResultId) {
      console.error('No quiz result ID provided for guest checkout');
      toast({
        title: "Error",
        description: "Missing result information. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Initiating guest checkout for result:', quizResultId);

    try {
      // Store email for guest checkout tracking
      localStorage.setItem('guestEmail', email);
      localStorage.setItem('guestQuizResultId', quizResultId);
      
      // Get newsletter opt-in preference
      const newsletterOptIn = localStorage.getItem('newsletterOptIn') === 'true';
      
      // Create guest checkout session via Edge Function
      const { data, error } = await supabase.functions.invoke('create-guest-checkout', {
        body: {
          resultId: quizResultId,
          email,
          couponCode,
          newsletterOptIn,
          metadata: {
            resultId: quizResultId,
            email,
            couponCode,
            newsletterOptIn,
            isGuest: true,
            returnUrl: `${window.location.origin}/assessment/${quizResultId}?success=true`
          }
        }
      });

      if (error) {
        console.error('Guest checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        console.error('No checkout URL received for guest:', data);
        throw new Error('No checkout URL received');
      }

      console.log('Guest checkout session created successfully:', {
        hasUrl: !!data.url,
        hasSessionId: !!data.sessionId,
        hasTrackingId: !!data.trackingId
      });
      
      // Store tracking information
      if (data.sessionId) {
        localStorage.setItem('stripeSessionId', data.sessionId);
        localStorage.setItem('purchaseResultId', quizResultId);
      }
      
      if (data.trackingId) {
        localStorage.setItem('purchaseTrackingId', data.trackingId);
      }
      
      // Update quiz result with tracking information
      try {
        await supabase
          .from('quiz_results')
          .update({
            guest_email: email,
            stripe_session_id: data.sessionId,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);
          
        console.log('Updated quiz result with guest checkout info');
      } catch (updateError) {
        console.error('Error updating quiz result:', updateError);
        // Continue anyway, this is not critical
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Guest checkout error:', error);
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
    handleGuestCheckout
  };
};
