
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export interface GuestCheckoutOptions {
  quizResultId: string | null;
  guestEmail: string;
  priceAmount: number;
  couponCode?: string;
}

export const useGuestCheckout = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async ({
    quizResultId,
    guestEmail,
    priceAmount,
    couponCode
  }: GuestCheckoutOptions) => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "No assessment result found. Please try taking the assessment again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // Validate email
      if (!guestEmail || !guestEmail.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return false;
      }
      
      console.log('Starting guest checkout flow for result:', quizResultId, 'with email:', guestEmail, 'price:', priceAmount);
      
      // Store email for future use
      localStorage.setItem('guestEmail', guestEmail);
      
      // Create a guest access token
      const accessToken = crypto.randomUUID();
      
      // Update the quiz result with guest email and token
      await supabase
        .from('quiz_results')
        .update({ 
          guest_email: guestEmail,
          guest_access_token: accessToken,
          guest_access_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', quizResultId);
      
      // Create purchase tracking record first to ensure we can recover the result ID
      const { data: trackingData, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: quizResultId,
          guest_email: guestEmail,
          status: 'pending',
          stripe_session_id: null, // Will be updated after checkout creation
        })
        .select()
        .single();
        
      if (trackingError) {
        console.error('Error creating purchase tracking:', trackingError);
        // Continue anyway - not critical for the main flow
      }
      
      // Create checkout session
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId: quizResultId,
            email: guestEmail,
            priceAmount,
            couponCode,
            metadata: {
              resultId: quizResultId,
              email: guestEmail,
              accessToken,
              couponCode,
              trackingId: trackingData?.id, // Include tracking ID if available
              returnUrl: `/assessment/${quizResultId}?success=true`
            }
          }
        }
      );
      
      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Error creating checkout session');
      }
      
      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }
      
      // Store information for verification after return
      if (data.sessionId) {
        // Store purchase data
        storePurchaseData(quizResultId, data.sessionId);
        localStorage.setItem('guestAccessToken', accessToken);
        
        // Update tracking information
        if (trackingData?.id) {
          await supabase
            .from('purchase_tracking')
            .update({ stripe_session_id: data.sessionId })
            .eq('id', trackingData.id);
        }
        
        // Update quiz result with session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);

        // Track coupon usage (if a coupon was applied)
        if (couponCode) {
          try {
            // First get the coupon ID
            const { data: couponData } = await supabase
              .from('coupons')
              .select('id, current_uses')
              .eq('code', couponCode)
              .single();
              
            if (couponData) {
              // Increment coupon usage counter
              await supabase
                .from('coupons')
                .update({ 
                  current_uses: (couponData.current_uses || 0) + 1 
                })
                .eq('id', couponData.id);
              
              // Record coupon usage
              await supabase
                .from('coupon_usage')
                .insert({
                  coupon_id: couponData.id,
                  user_id: null,
                  guest_email: guestEmail,
                  purchase_amount: priceAmount,
                  discount_amount: data.discountAmount || 0
                });
            }
          } catch (couponError) {
            console.error('Error tracking coupon usage:', couponError);
            // Continue with checkout even if coupon tracking fails
          }
        }
      }
      
      // Redirect to Stripe
      console.log('Redirecting to Stripe checkout URL:', data.url);
      window.location.href = data.url;
      return true;
      
    } catch (error: any) {
      console.error('Guest checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Could not process your checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    handleCheckout
  };
};
