
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

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      console.log('Initiating purchase flow:', {
        resultId,
        userId: userId || 'guest',
        timestamp: new Date().toISOString(),
        hasEmail: !!email
      });

      // Create purchase tracking record first
      const accessToken = crypto.randomUUID();
      const { data: tracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: resultId,
          user_id: userId,
          guest_email: !userId ? email : undefined,
          status: 'pending',
          access_token: !userId ? accessToken : undefined
        })
        .select()
        .single();

      if (trackingError) {
        console.error('Purchase tracking error:', trackingError);
        throw trackingError;
      }

      console.log('Created purchase tracking:', {
        trackingId: tracking.id,
        status: tracking.status
      });

      // Store tracking ID and result ID in localStorage (for both logged in users and guests)
      localStorage.setItem('purchaseTrackingId', tracking.id);
      localStorage.setItem('purchaseResultId', resultId);
      
      // Store guest data only if not logged in
      if (!userId) {
        localStorage.setItem('guestQuizResultId', resultId);
        localStorage.setItem('guestAccessToken', accessToken);
        if (email) localStorage.setItem('guestEmail', email);
      } 

      // Update quiz result with purchase initiated status
      await supabase
        .from('quiz_results')
        .update({ 
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending'
        })
        .eq('id', resultId);

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId,
            email: email || session?.user?.email,
            userId,
            metadata: {
              resultId,
              email: email || session?.user?.email,
              userId,
              accessToken: !userId ? accessToken : undefined,
              trackingId: tracking.id,
              returnUrl: `/assessment/${resultId}?success=true`
            }
          }
        }
      );

      if (checkoutError) {
        console.error('Checkout error:', checkoutError);
        throw checkoutError;
      }
      
      if (!checkoutData?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout:', {
        sessionId: checkoutData.sessionId,
        hasUrl: !!checkoutData.url
      });

      // Store Stripe session ID
      if (checkoutData.sessionId) {
        // Update quiz result with stripe session
        await supabase
          .from('quiz_results')
          .update({ stripe_session_id: checkoutData.sessionId })
          .eq('id', resultId);

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
