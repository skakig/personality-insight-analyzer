
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseHandler = (resultId: string) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
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
      console.log(`Initiating purchase for assessment ${resultId}`);
      
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
              metadata: {
                resultId,
                userId: session.user.id,
                returnUrl: `/assessment/${resultId}?success=true`
              }
            }
          }
        );
        
        if (error) {
          console.error('Error creating checkout session:', error);
          throw new Error(error.message || 'Failed to create checkout session');
        }
        
        if (!data?.url) {
          throw new Error('No checkout URL received');
        }
        
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
        }
        
        // Redirect to Stripe
        window.location.href = data.url;
      } catch (error) {
        console.error('Purchase error:', error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to process your payment. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    handlePurchase
  };
};
