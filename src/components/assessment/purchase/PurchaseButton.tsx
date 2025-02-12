
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";
import { usePurchaseHandler } from "./usePurchaseHandler";

interface PurchaseButtonProps {
  onClick: () => void;
  loading: boolean;
  isPurchased?: boolean;
  resultId?: string;
}

export const PurchaseButton = ({ 
  onClick, 
  loading, 
  isPurchased, 
  resultId 
}: PurchaseButtonProps) => {
  const { handlePurchase } = usePurchaseHandler(resultId);

  return (
    <Button
      onClick={isPurchased ? onClick : handlePurchase}
      disabled={loading}
      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        isPurchased ? "View Full Report" : "Unlock Full Report"
      )}
    </Button>
  );
};
