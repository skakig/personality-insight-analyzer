import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PurchaseCreditsButton = () => {
  const handlePurchaseCredits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          mode: 'payment',
          productType: 'credits'
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate credit purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handlePurchaseCredits}
      className="w-full"
      variant="outline"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      Purchase Additional Credits
    </Button>
  );
};