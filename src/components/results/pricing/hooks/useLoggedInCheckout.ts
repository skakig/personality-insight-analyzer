
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export const useLoggedInCheckout = (quizResultId: string | null, userId: string) => {
  const [loading, setLoading] = useState(false);

  const handleLoggedInCheckout = async () => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "Unable to process your purchase. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Processing logged-in user checkout:', {
        userId,
        resultId: quizResultId,
        timestamp: new Date().toISOString()
      });

      // Create purchase tracking record
      const { data: tracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: quizResultId,
          user_id: userId,
          status: 'pending',
          stripe_session_id: null
        })
        .select()
        .single();

      if (trackingError) {
        console.error('Error creating purchase tracking:', trackingError);
        throw new Error('Failed to prepare checkout. Please try again.');
      }

      // Update quiz result with pending status
      await supabase
        .from('quiz_results')
        .update({ 
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending'
        })
        .eq('id', quizResultId);

      // Store information for verification after return
      localStorage.setItem('purchaseTrackingId', tracking.id);
      localStorage.setItem('purchaseResultId', quizResultId);
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId: quizResultId,
          priceAmount: 1499,
          mode: 'payment',
          metadata: {
            userId,
            resultId: quizResultId,
            trackingId: tracking.id,
            returnUrl: `/assessment/${quizResultId}?success=true`
          }
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }
      
      if (!data?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      // Store the Stripe session ID for verification
      if (data.sessionId) {
        // Update purchase tracking record
        await supabase
          .from('purchase_tracking')
          .update({ 
            stripe_session_id: data.sessionId 
          })
          .eq('id', tracking.id);
        
        // Update quiz result with stripe session
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId
          })
          .eq('id', quizResultId);

        // Store session data in localStorage using the utility function
        storePurchaseData(quizResultId, data.sessionId, userId);
      }

      // Add a small delay to ensure data is saved before redirecting
      setTimeout(() => {
        window.location.href = data.url;
      }, 100);
      
      return true;
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    handleLoggedInCheckout
  };
};
