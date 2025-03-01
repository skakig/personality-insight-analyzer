
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { CheckoutButton } from "./pricing/CheckoutButton";
import { useCheckoutFlow } from "./pricing/hooks/useCheckoutFlow";

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
