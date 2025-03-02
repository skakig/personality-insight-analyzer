
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseHandler = (resultId: string) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (couponCode?: string) => {
    try {
      if (!resultId) {
        console.error('Purchase attempt failed: Missing result ID');
        toast({
          title: "Error",
          description: "Unable to process purchase. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      console.log(`Initiating purchase for assessment ${resultId}`, couponCode ? `with coupon: ${couponCode}` : '');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        window.location.href = `/auth?redirect=/assessment/${resultId}`;
        return;
      }
      
      try {
        // Create checkout session via Supabase function
        const { data, error } = await supabase.functions.invoke(
          'create-checkout-session',
          {
            body: {
              resultId,
              userId: session.user.id,
              email: session.user.email,
              priceAmount: 1499, // Default price
              couponCode,
              metadata: {
                resultId,
                userId: session.user.id,
                couponCode,
                returnUrl: `/assessment/${resultId}?success=true`
              }
            }
          }
        );
        
        if (error) {
          console.error('Error creating checkout session:', error);
          
          // Check for specific error types
          if (error.message?.includes('Edge Function') || error.status === 500) {
            throw new Error('Payment service is currently unavailable. Please try again later.');
          } else if (error.message?.includes('policy for relation') || error.message?.includes('infinite recursion')) {
            throw new Error('Database access error. Our team has been notified.');
          } else {
            throw new Error(error.message || 'Failed to create checkout session');
          }
        }
        
        if (!data?.url) {
          throw new Error('No checkout URL received');
        }
        
        console.log('Checkout session created successfully:', {
          hasUrl: !!data.url,
          hasSessionId: !!data.sessionId,
          discountApplied: !!data.discountAmount
        });
        
        // Store session data for verification after return
        if (data.sessionId) {
          localStorage.setItem('purchaseResultId', resultId);
          localStorage.setItem('stripeSessionId', data.sessionId);
          
          // Update result with session ID
          await supabase
            .from('quiz_results')
            .update({ 
              stripe_session_id: data.sessionId,
              purchase_initiated_at: new Date().toISOString(),
              purchase_status: 'pending'
            })
            .eq('id', resultId);
            
          // Track coupon usage if provided
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
                    user_id: session.user.id,
                    purchase_amount: 1499,
                    discount_amount: data.discountAmount || 0
                  });
                  
                console.log('Tracked coupon usage:', {
                  couponId: couponData.id,
                  userId: session.user.id,
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
        window.location.href = data.url;
      } catch (error: any) {
        console.error('Purchase error:', error);
        setLoading(false);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to process your payment. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    handlePurchase
  };
};
