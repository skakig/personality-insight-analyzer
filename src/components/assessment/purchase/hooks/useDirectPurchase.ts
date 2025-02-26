
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDirectPurchase = (
  resultId: string,
  setPurchaseLoading: (loading: boolean) => void
) => {
  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating purchase for result:', resultId);
      
      // Get current session if any
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Mark purchase as initiated
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({
          purchase_status: 'initiated',
          purchase_initiated_at: new Date().toISOString()
        })
        .eq('id', resultId);

      if (updateError) {
        console.error('Error updating quiz result:', updateError);
        throw updateError;
      }

      // 2. Create purchase tracking record
      const { data: trackingData, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: resultId,
          user_id: session?.user?.id,
          status: 'initiated',
          metadata: {
            isGuest: !session?.user,
            initiatedAt: new Date().toISOString(),
            returnUrl: `/assessment/${resultId}`
          }
        })
        .select()
        .single();

      if (trackingError) {
        console.error('Error creating purchase tracking:', trackingError);
        throw trackingError;
      }

      // Store tracking ID and result ID in localStorage
      localStorage.setItem('currentPurchaseId', trackingData.id);
      localStorage.setItem('purchaseResultId', resultId);

      // 3. Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          priceAmount: 1499, // Original amount - discount will be applied in the function
          metadata: {
            resultId,
            userId: session?.user?.id,
            purchaseTrackingId: trackingData.id,
            isGuest: !session?.user,
            returnUrl: `/assessment/${resultId}`
          }
        }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout:', {
        resultId,
        trackingId: trackingData.id,
        checkoutUrl: data.url,
        timestamp: new Date().toISOString()
      });

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  return handlePurchase;
};
