
import { useEffect } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { CheckoutButton } from "./pricing/CheckoutButton";
import { useCheckoutFlow } from "./pricing/hooks/useCheckoutFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

interface PricingSectionProps {
  session: any;
  quizResultId: string | null;
}

export const PricingSection = ({ session, quizResultId }: PricingSectionProps) => {
  const {
    email,
    setEmail,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    loading,
    handleGetDetailedResults,
    handleGuestSubmit
  } = useCheckoutFlow(session, quizResultId);

  // Verify authentication state when component mounts
  useEffect(() => {
    const verifyAuthState = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('PricingSection authentication check:', {
          hasSession: !!session,
          hasCurrentSession: !!currentSession,
          hasQuizResultId: !!quizResultId,
          userId: currentSession?.user?.id || session?.user?.id || 'guest',
          timestamp: new Date().toISOString()
        });
        
        // Check if this is a return from Stripe with success=true
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success') === 'true';
        
        if (success && quizResultId) {
          toast({
            title: "Purchase Successful!",
            description: "Your detailed report is now available.",
          });
          
          // Handle successful purchase return
          console.log('Detected successful return from Stripe checkout');
          
          // Let's update the purchase status directly
          try {
            const sessionId = localStorage.getItem('stripeSessionId');
            
            if (sessionId) {
              await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase'
                })
                .eq('id', quizResultId);
              
              console.log('Successfully updated purchase status');
            }
          } catch (updateError) {
            console.error('Error updating purchase status:', updateError);
          }
        }
      } catch (error) {
        console.error('Error checking authentication state:', error);
      }
    };
    
    verifyAuthState();
  }, [session, quizResultId]);

  return (
    <div className="text-center pt-6">
      <PriceDisplay originalPrice="$29.99" discountedPrice="$14.99" />
      
      <CheckoutButton 
        onClick={handleGetDetailedResults}
        loading={loading}
      />
      
      <PricingFooter />

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleGuestSubmit}
        loading={loading}
      />
    </div>
  );
};
