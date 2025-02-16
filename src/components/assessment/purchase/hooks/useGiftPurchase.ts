
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useGiftPurchase = (
  resultId: string,
  giftEmail: string,
  setPurchaseLoading: (loading: boolean) => void,
  setIsGiftDialogOpen: (open: boolean) => void
) => {
  const handleGiftPurchase = async () => {
    if (!giftEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPurchaseLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          giftRecipientEmail: giftEmail,
          priceAmount: 1499,
          metadata: {
            resultId,
            isGift: true,
            giftRecipientEmail: giftEmail
          }
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

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
      setIsGiftDialogOpen(false);
    }
  };

  return handleGiftPurchase;
};
