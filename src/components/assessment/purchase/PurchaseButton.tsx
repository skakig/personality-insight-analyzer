import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const PurchaseButton = ({ onClick, loading }: PurchaseButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Unlock Full Report"
      )}
    </Button>
  );
};