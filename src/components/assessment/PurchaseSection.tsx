import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseSectionProps {
  resultId: string;
}

export const PurchaseSection = ({ resultId }: PurchaseSectionProps) => {
  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { resultId }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
        <h4 className="font-medium text-lg mb-2">Unlock Your Full Report</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="h-4 w-4 text-primary" />
            Comprehensive personality analysis
          </li>
          <li className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="h-4 w-4 text-primary" />
            Detailed category breakdowns
          </li>
          <li className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="h-4 w-4 text-primary" />
            Personalized growth recommendations
          </li>
        </ul>
        <Button 
          onClick={handlePurchase}
          className="w-full mt-4 group"
        >
          Purchase Full Report
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};