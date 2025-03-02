
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export interface LoggedInCheckoutOptions {
  quizResultId: string | null;
  userId: string;
  email: string | null;
  priceAmount: number;
  couponCode?: string;
}

export const useLoggedInCheckout = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async ({
    quizResultId,
    userId,
    email,
    priceAmount,
    couponCode
  }: LoggedInCheckoutOptions) => {
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
      
      console.log('Starting logged-in checkout flow for result:', quizResultId, 'with price:', priceAmount, 'coupon:', couponCode);
      
      // Create checkout session via Supabase function
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId: quizResultId,
            userId,
            email,
            priceAmount,
            couponCode,
            metadata: {
              resultId: quizResultId,
              userId,
              couponCode,
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
      
      console.log('Checkout session created successfully:', {
        hasUrl: !!data.url,
        hasSessionId: !!data.sessionId,
        discountApplied: !!data.discountAmount
      });
      
      // Store information for verification after return
      if (data.sessionId) {
        // Store purchase data
        storePurchaseData(quizResultId, data.sessionId, userId);
        
        // Update result with session ID
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
                  user_id: userId,
                  purchase_amount: priceAmount,
                  discount_amount: data.discountAmount || 0
                });
                
              console.log('Tracked coupon usage:', {
                couponId: couponData.id,
                userId,
                discountAmount: data.discountAmount
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
      console.error('Logged-in checkout error:', error);
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
