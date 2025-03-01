
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

    // Check if userId is provided
    if (!userId) {
      console.error('No user ID provided for logged-in checkout');
      toast({
        title: "Authentication Error",
        description: "Please ensure you're logged in and try again.",
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

      // Double-check authentication before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No active session found for user:', userId);
        toast({
          title: "Session Error",
          description: "Your session may have expired. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

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

      console.log('Created purchase tracking record:', tracking.id);

      // Update quiz result with pending status
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ 
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending',
          user_id: userId  // Ensure user ID is associated with the result
        })
        .eq('id', quizResultId);
        
      if (updateError) {
        console.error('Error updating quiz result:', updateError);
        // Continue anyway as this isn't critical
      }

      // Store information for verification after return
      localStorage.setItem('purchaseTrackingId', tracking.id);
      localStorage.setItem('purchaseResultId', quizResultId);
      localStorage.setItem('purchaseUserId', userId);
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId: quizResultId,
          userId: userId,
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

      console.log('Logged-in checkout session created:', {
        sessionId: data.sessionId,
        hasUrl: !!data.url,
        redirectingTo: data.url
      });

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
            stripe_session_id: data.sessionId,
            user_id: userId  // Ensure user ID is associated again
          })
          .eq('id', quizResultId);

        // Store session data in localStorage using the utility function
        storePurchaseData(quizResultId, data.sessionId, userId);
      }

      // Add a small delay to ensure data is saved before redirecting
      setTimeout(() => {
        window.location.href = data.url;
      }, 200);
      
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
