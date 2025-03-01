
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { usePurchaseState } from "./hooks/usePurchaseState";
import { usePurchaseFlow } from "./hooks/usePurchaseFlow";

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
  const { internalLoading, setInternalLoading } = usePurchaseState();
  const { initiatePurchase } = usePurchaseFlow(resultId, email, onPurchaseStart, onPurchaseComplete);
  
  const loading = externalLoading || internalLoading;

  const handleInitiatePurchase = () => {
    console.log('Purchase button clicked for result:', resultId);
    initiatePurchase(setInternalLoading);
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
      onClick={handleInitiatePurchase}
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
