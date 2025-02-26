
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PurchaseButtonProps {
  resultId: string;
  email?: string;
  loading?: boolean;
  isPurchased?: boolean;
  onPurchaseStart?: () => void;
  onPurchaseComplete?: () => void;
}

export const PurchaseButton = ({ 
  resultId, 
  email, 
  loading: externalLoading,
  isPurchased,
  onPurchaseStart,
  onPurchaseComplete 
}: PurchaseButtonProps) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const initiatePurchase = async () => {
    try {
      setInternalLoading(true);
      if (onPurchaseStart) onPurchaseStart();

      // Create purchase tracking record
      const accessToken = crypto.randomUUID();
      const { data: tracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: resultId,
          guest_email: email,
          status: 'pending',
          access_token: accessToken
        })
        .select()
        .single();

      if (trackingError) throw trackingError;

      // Store essential data
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
              accessToken,
              trackingId: tracking.id
            }
          }
        }
      );

      if (checkoutError) throw checkoutError;
      if (!checkoutData?.url) throw new Error('No checkout URL received');

      // Store Stripe session ID for verification
      if (checkoutData.sessionId) {
        localStorage.setItem('stripeSessionId', checkoutData.sessionId);
      }

      window.location.href = checkoutData.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
      setInternalLoading(false);
    }
  };

  if (isPurchased) {
    return (
      <Button 
        onClick={() => window.location.href = `/assessment/${resultId}`}
        className="w-full bg-primary hover:bg-primary/90"
      >
        View Full Report
      </Button>
    );
  }

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
