
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export const usePurchaseFlow = (
  resultId: string, 
  email?: string, 
  onPurchaseStart?: () => void,
  onPurchaseComplete?: () => void
) => {
  const initiatePurchase = async (setInternalLoading: (loading: boolean) => void) => {
    if (!resultId) {
      console.error('Purchase initiation failed: Missing result ID');
      toast({
        title: "Error",
        description: "Unable to process purchase due to missing information.",
        variant: "destructive",
      });
      return;
    }
    
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
          access_token: !userId ? accessToken : undefined,
          stripe_session_id: null // Initialize this field
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
        if (email) {
          localStorage.setItem('guestEmail', email);
          
          // Also update the quiz result with guest email if available
          await supabase
            .from('quiz_results')
            .update({ 
              guest_email: email,
              guest_access_token: accessToken,
              guest_access_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            })
            .eq('id', resultId);
        }
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
            priceAmount: 1499,
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

      // Store Stripe session ID in tracking record
      if (checkoutData.sessionId) {
        try {
          // Update purchase tracking with Stripe session ID
          await supabase
            .from('purchase_tracking')
            .update({ 
              stripe_session_id: checkoutData.sessionId 
            })
            .eq('id', tracking.id);
            
          // Update quiz result with stripe session
          await supabase
            .from('quiz_results')
            .update({ 
              stripe_session_id: checkoutData.sessionId,
              guest_email: email || undefined // Ensure guest email is stored
            })
            .eq('id', resultId);

          // Store both result ID and session ID persistently
          storePurchaseData(resultId, checkoutData.sessionId, userId);
        } catch (updateError) {
          console.error('Failed to update session ID:', updateError);
          // Continue anyway - this isn't critical
        }
      }

      // Add a small delay to ensure data is saved before redirecting
      setTimeout(() => {
        window.location.href = checkoutData.url;
      }, 100);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
      setInternalLoading(false);
      
      if (onPurchaseComplete) onPurchaseComplete();
    }
  };

  return { initiatePurchase };
};
