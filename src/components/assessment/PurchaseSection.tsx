
import { BenefitsList } from "./purchase/BenefitsList";
import { PurchaseButton } from "./purchase/PurchaseButton";
import { EmailPurchaseDialog } from "./purchase/EmailPurchaseDialog";
import { GiftPurchaseDialog } from "./purchase/GiftPurchaseDialog";
import { usePurchaseHandler } from "./purchase/usePurchaseHandler";

interface PurchaseSectionProps {
  resultId: string;
  loading: boolean;
}

export const PurchaseSection = ({ resultId, loading }: PurchaseSectionProps) => {
  const {
    purchaseLoading,
    giftEmail,
    setGiftEmail,
    email,
    setEmail,
    isGiftDialogOpen,
    setIsGiftDialogOpen,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    handlePurchase,
    handleGiftPurchase,
    handleEmailPurchase
  } = usePurchaseHandler(resultId);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-medium text-lg">Unlock Your Full Potential</h4>
        </div>
        
        <div className="space-y-4">
          <BenefitsList />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <EmailPurchaseDialog 
              open={isEmailDialogOpen}
              onOpenChange={setIsEmailDialogOpen}
              email={email}
              setEmail={setEmail}
              onPurchase={handleEmailPurchase}
              loading={purchaseLoading}
            />
            
            <PurchaseButton 
              onClick={() => handlePurchase()} 
              loading={loading || purchaseLoading}
            />
            
            <GiftPurchaseDialog 
              open={isGiftDialogOpen}
              onOpenChange={setIsGiftDialogOpen}
              giftEmail={giftEmail}
              setGiftEmail={setGiftEmail}
              onPurchase={handleGiftPurchase}
              loading={purchaseLoading}
            />
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Join thousands of others who have transformed their approach to ethical decision-making
          </p>
        </div>
      </div>
    </div>
  );
};
