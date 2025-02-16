
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useEmailPurchase = (
  resultId: string,
  email: string,
  setPurchaseLoading: (loading: boolean) => void,
  setIsEmailDialogOpen: (open: boolean) => void
) => {
  const handleEmailPurchase = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive the report.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
          email,
          priceAmount: 1499,
          metadata: {
            resultId,
            isGuest: true,
            email
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
      setIsEmailDialogOpen(false);
    }
  };

  return handleEmailPurchase;
};
