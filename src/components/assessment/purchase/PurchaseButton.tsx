import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export const PurchaseButton = ({ onClick, loading }: PurchaseButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      disabled={loading}
      className="w-full mt-6 group bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
    >
      <span className="flex items-center">
        {loading ? "Processing..." : "Unlock Full Report"}
        {!loading && <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />}
      </span>
    </Button>
  );
};