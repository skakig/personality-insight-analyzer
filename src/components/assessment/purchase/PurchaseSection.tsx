
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Gift, Loader2, Mail } from "lucide-react";
import { EmailPurchaseDialog } from "./EmailPurchaseDialog";
import { GiftPurchaseDialog } from "./GiftPurchaseDialog";
import { PurchaseButton } from "./PurchaseButton";
import { BenefitsList } from "./BenefitsList";
import { useModalState } from "./hooks/useModalState";
import { useDirectPurchase } from "./hooks/useDirectPurchase";
import { useEmailPurchase } from "./hooks/useEmailPurchase";
import { useGiftPurchase } from "./hooks/useGiftPurchase";
import { CouponInput } from "./CouponInput";

interface PurchaseSectionProps {
  resultId: string;
  session: any;
}

export const PurchaseSection = ({ resultId, session }: PurchaseSectionProps) => {
  const [discountedAmount, setDiscountedAmount] = useState(1499); // Default to full price
  const {
    purchaseLoading,
    setPurchaseLoading,
    giftEmail,
    setGiftEmail,
    email,
    setEmail,
    isGiftDialogOpen,
    setIsGiftDialogOpen,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
  } = useModalState();

  const handlePurchase = useDirectPurchase(resultId, setPurchaseLoading);
  const handleEmailPurchase = useEmailPurchase(resultId, email, setPurchaseLoading, setIsEmailDialogOpen);
  const handleGiftPurchase = useGiftPurchase(resultId, giftEmail, setPurchaseLoading, setIsGiftDialogOpen);

  const handleCouponApplied = ({ finalAmount }: { finalAmount: number }) => {
    setDiscountedAmount(finalAmount);
  };

  return (
    <div className="space-y-6">
      <BenefitsList />
      
      <div className="space-y-4">
        <CouponInput 
          originalAmount={1499}
          onCouponApplied={handleCouponApplied}
          className="mb-4"
        />

        {session?.user ? (
          <PurchaseButton
            onClick={handlePurchase}
            loading={purchaseLoading}
          />
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => setIsEmailDialogOpen(true)}
              className="w-full"
              disabled={purchaseLoading}
            >
              {purchaseLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Purchase with Email
                </>
              )}
            </Button>

            <Button
              onClick={() => setIsGiftDialogOpen(true)}
              variant="outline"
              className="w-full"
              disabled={purchaseLoading}
            >
              <Gift className="mr-2 h-4 w-4" />
              Purchase as Gift
            </Button>
          </div>
        )}
      </div>

      <EmailPurchaseDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleEmailPurchase}
        loading={purchaseLoading}
      />

      <GiftPurchaseDialog
        open={isGiftDialogOpen}
        onOpenChange={setIsGiftDialogOpen}
        email={giftEmail}
        onEmailChange={(e) => setGiftEmail(e.target.value)}
        onSubmit={handleGiftPurchase}
        loading={purchaseLoading}
      />
    </div>
  );
};
