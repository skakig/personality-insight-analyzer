
import { useEffect } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { CheckoutButton } from "./pricing/CheckoutButton";
import { useCheckoutFlow } from "./pricing/hooks/useCheckoutFlow";
import { supabase } from "@/integrations/supabase/client";

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
          userId: currentSession?.user?.id || session?.user?.id || 'guest'
        });
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
