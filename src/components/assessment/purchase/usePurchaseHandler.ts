
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePurchaseHandler = (resultId?: string) => {
  const navigate = useNavigate();

  const handlePurchase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId: session.user.id,
          resultId,
          accessMethod: 'purchase'
        }
      });

      if (error) throw error;
      
      if (data?.method === 'direct') {
        // Direct access through subscription
        navigate(data.url);
        toast({
          title: "Success",
          description: "Full report unlocked using your subscription.",
        });
      } else if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePurchase };
};
