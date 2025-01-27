import { Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BenefitsList } from "./purchase/BenefitsList";
import { PurchaseButton } from "./purchase/PurchaseButton";
import { useState } from "react";

interface PurchaseSectionProps {
  resultId: string;
  loading: boolean;
}

export const PurchaseSection = ({ resultId, loading }: PurchaseSectionProps) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating checkout for result:', resultId);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No active session found:', sessionError);
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase the detailed report.",
          variant: "destructive",
        });
        return;
      }

      // Purchase individual report
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          userId: session.user.id,
          mode: 'payment'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }
      
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-lg">Unlock Your Full Potential</h4>
        </div>
        
        <div className="space-y-4">
          <BenefitsList />
          <PurchaseButton 
            onClick={handlePurchase} 
            loading={loading || purchaseLoading}
          />
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Join thousands of others who have transformed their approach to ethical decision-making
          </p>
        </div>
      </div>
    </div>
  );
};