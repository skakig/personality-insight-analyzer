
import { BenefitsList } from "@/components/assessment/purchase/BenefitsList";
import { PurchaseButton } from "@/components/assessment/purchase/PurchaseButton";
import { EmailPurchaseDialog } from "@/components/assessment/purchase/EmailPurchaseDialog";
import { GiftPurchaseDialog } from "@/components/assessment/purchase/GiftPurchaseDialog";
import { usePurchaseHandler } from "@/components/assessment/purchase/usePurchaseHandler";
import { Button } from "@/components/ui/button";
import { LockOpen } from "lucide-react";

interface PurchaseSectionProps {
  resultId: string;
  loading: boolean;
  isPurchased?: boolean;
}

export const PurchaseSection = ({ resultId, loading, isPurchased }: PurchaseSectionProps) => {
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
    handleEmailPurchase,
    handleSaveReport
  } = usePurchaseHandler(resultId);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-medium text-lg">
            {isPurchased ? "Your Full Report" : "Unlock Your Full Potential"}
          </h4>
        </div>
        
        <div className="space-y-4">
          {!isPurchased && <BenefitsList />}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <EmailPurchaseDialog 
              open={isEmailDialogOpen}
              onOpenChange={setIsEmailDialogOpen}
              email={email}
              setEmail={setEmail}
              onPurchase={handleEmailPurchase}
              loading={purchaseLoading}
            />
            
            {isPurchased ? (
              <Button
                onClick={handleSaveReport}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                disabled={loading}
              >
                <LockOpen className="mr-2 h-4 w-4" />
                Save Your Report
              </Button>
            ) : (
              <PurchaseButton 
                onClick={() => handlePurchase()} 
                loading={loading || purchaseLoading}
                isPurchased={isPurchased}
                resultId={resultId}
              />
            )}
            
            <GiftPurchaseDialog 
              open={isGiftDialogOpen}
              onOpenChange={setIsGiftDialogOpen}
              giftEmail={giftEmail}
              setGiftEmail={setGiftEmail}
              onPurchase={handleGiftPurchase}
              loading={purchaseLoading}
            />
          </div>
          
          {!isPurchased && (
            <p className="text-xs text-center text-gray-500 mt-4">
              Join thousands of others who have transformed their approach to ethical decision-making
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
