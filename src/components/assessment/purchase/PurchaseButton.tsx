
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PurchaseButtonProps {
  resultId: string;
  email?: string;
  onPurchaseStart?: () => void;
  onPurchaseComplete?: () => void;
}

export const PurchaseButton = ({ 
  resultId, 
  email, 
  onPurchaseStart,
  onPurchaseComplete 
}: PurchaseButtonProps) => {
  const [loading, setLoading] = useState(false);

  const verifyPurchaseStatus = async (sessionId: string) => {
    try {
      // Check if purchase is already completed
      const { data: purchase, error: purchaseError } = await supabase
        .from('guest_purchases')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('status', 'completed')
        .maybeSingle();

      if (purchaseError) throw purchaseError;

      if (purchase) {
        if (onPurchaseComplete) onPurchaseComplete();
        return true;
      }

      // Fallback: Check by result ID and email
      const { data: fallbackPurchase, error: fallbackError } = await supabase
        .from('guest_purchases')
        .select('*')
        .eq('result_id', resultId)
        .eq('email', email)
        .eq('status', 'completed')
        .maybeSingle();

      if (fallbackError) throw fallbackError;

      if (fallbackPurchase) {
        if (onPurchaseComplete) onPurchaseComplete();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying purchase:', error);
      return false;
    }
  };

  const initiatePurchase = async () => {
    try {
      setLoading(true);
      if (onPurchaseStart) onPurchaseStart();

      // First verify if there's already a completed purchase
      const sessionId = localStorage.getItem('stripeSessionId');
      if (sessionId) {
        const isVerified = await verifyPurchaseStatus(sessionId);
        if (isVerified) {
          setLoading(false);
          return;
        }
      }

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
