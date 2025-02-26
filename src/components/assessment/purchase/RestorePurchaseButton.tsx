
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface RestorePurchaseButtonProps {
  resultId: string;
  email?: string;
}

export const RestorePurchaseButton = ({ resultId, email }: RestorePurchaseButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleRestorePurchase = async () => {
    try {
      setLoading(true);
      console.log('Attempting to restore purchase for:', { resultId, email });

      let query = supabase
        .from('purchase_tracking')
        .select('*')
        .eq('quiz_result_id', resultId);

      if (email) {
        query = query.eq('guest_email', email);
      }

      const { data: purchaseData, error: purchaseError } = await query
        .eq('status', 'completed')
        .maybeSingle();

      if (purchaseError) throw purchaseError;

      if (!purchaseData) {
        toast({
          title: "Purchase Not Found",
          description: "We couldn't find a completed purchase for this assessment.",
          variant: "destructive",
        });
        return;
      }

      // Update the quiz result with purchase details
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          purchase_status: 'completed',
          purchase_date: purchaseData.completed_at,
          access_method: 'purchase'
        })
        .eq('id', resultId);

      if (updateError) throw updateError;

      toast({
        title: "Purchase Restored",
        description: "Your purchase has been successfully restored.",
      });

      // Reload the page to show the full report
      window.location.reload();
    } catch (error: any) {
      console.error('Error restoring purchase:', error);
      toast({
        title: "Error",
        description: "Failed to restore purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleRestorePurchase}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Restoring...
        </>
      ) : (
        <>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Restore Purchase
        </>
      )}
    </Button>
  );
};
