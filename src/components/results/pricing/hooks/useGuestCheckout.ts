
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export const useGuestCheckout = (quizResultId: string | null) => {
  const [loading, setLoading] = useState(false);

  const handleGuestCheckout = async (email: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue with the purchase.",
        variant: "destructive",
      });
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);

    try {
      const guestAccessToken = localStorage.getItem('guestAccessToken') || crypto.randomUUID();
      
      // Create purchase tracking record for guest
      const { data: tracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: quizResultId,
          guest_email: email,
          status: 'pending',
          access_token: guestAccessToken || null
        })
        .select()
        .single();

      if (trackingError) {
        console.error('Error creating guest purchase tracking:', trackingError);
      } else {
        localStorage.setItem('purchaseTrackingId', tracking.id);
      }
      
      // Update quiz result with guest information
      await supabase
        .from('quiz_results')
        .update({ 
          guest_email: email,
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending',
          guest_access_token: guestAccessToken,
          guest_access_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .eq('id', quizResultId);

      // Save guest email for later verification
      localStorage.setItem('guestEmail', email);
      localStorage.setItem('guestAccessToken', guestAccessToken);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId: quizResultId,
          email,
          priceAmount: 1499,
          metadata: {
            isGuest: true,
            email,
            tempAccessToken: guestAccessToken,
            resultId: quizResultId,
            trackingId: tracking?.id,
            returnUrl: `/assessment/${quizResultId}?success=true`
          }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      // Store session data using the utility function
      if (data.sessionId) {
        storePurchaseData(quizResultId, data.sessionId);
        
        // Update the quiz result with the session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId 
          })
          .eq('id', quizResultId);
      }

      // Add a small delay to ensure data is saved before redirecting
      setTimeout(() => {
        window.location.href = data.url;
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    handleGuestCheckout
  };
};
