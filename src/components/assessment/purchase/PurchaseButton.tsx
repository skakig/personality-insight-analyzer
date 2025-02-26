
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PurchaseButtonProps {
  resultId: string;
  email?: string;
  onPurchaseStart?: () => void;
}

export const PurchaseButton = ({ resultId, email, onPurchaseStart }: PurchaseButtonProps) => {
  const [loading, setLoading] = useState(false);

  const initiatePurchase = async () => {
    try {
      setLoading(true);
      if (onPurchaseStart) onPurchaseStart();

      // Create purchase tracking record first
      const accessToken = crypto.randomUUID();
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: resultId,
          guest_email: email,
          status: 'pending',
          access_token: accessToken
        });

      if (trackingError) throw trackingError;

      // Store tokens temporarily
      localStorage.setItem('guestQuizResultId', resultId);
      localStorage.setItem('guestAccessToken', accessToken);
      if (email) localStorage.setItem('guestEmail', email);

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId,
            email,
            metadata: {
              resultId,
              email,
              accessToken
            }
          }
        }
      );

      if (checkoutError) throw checkoutError;
      if (!checkoutData?.url) throw new Error('No checkout URL received');

      window.location.href = checkoutData.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={initiatePurchase}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Purchase Full Report
        </>
      )}
    </Button>
  );
};
