import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseSectionProps {
  resultId: string;
}

export const PurchaseSection = ({ resultId }: PurchaseSectionProps) => {
  const handlePurchase = async () => {
    try {
      console.log('Initiating checkout for result:', resultId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase the detailed report.",
          variant: "destructive",
        });
        return;
      }

      console.log('Calling create-checkout-session with:', {
        resultId,
        userId: session.user.id,
        mode: 'subscription'
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          userId: session.user.id,
          mode: 'subscription'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout URL:', data.url);
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
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-lg">Unlock Your Full Potential</h4>
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Deep Personal Insights</p>
                <p className="text-sm text-gray-600">Understand your unique moral framework and decision-making patterns</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Growth Roadmap</p>
                <p className="text-sm text-gray-600">Get a personalized path to reaching your next moral level</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Practical Exercises</p>
                <p className="text-sm text-gray-600">Access targeted activities to strengthen your moral reasoning</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handlePurchase}
            className="w-full mt-6 group bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <span>Unlock Full Report</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Join thousands of others who have transformed their approach to ethical decision-making
          </p>
        </div>
      </div>
    </div>
  );
};