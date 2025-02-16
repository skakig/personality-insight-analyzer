
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDirectPurchase = (
  resultId: string,
  setPurchaseLoading: (loading: boolean) => void
) => {
  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating checkout for result:', resultId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          priceAmount: 1499,
          metadata: {
            resultId,
            isGuest: !session?.user
          }
        }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }
      
      if (!data?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout:', {
        resultId,
        checkoutUrl: data.url,
        timestamp: new Date().toISOString()
      });

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
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
