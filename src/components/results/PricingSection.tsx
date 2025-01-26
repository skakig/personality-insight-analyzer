import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PricingSectionProps {
  onPurchase: () => void;
  isAuthenticated: boolean;
}

export const PricingSection = ({ onPurchase, isAuthenticated }: PricingSectionProps) => {
  return (
    <div className="text-center space-y-6 pt-6 border-t">
      <div className="space-y-2">
        <p className="text-3xl font-bold">
          <span className="text-primary line-through opacity-75">$49.99</span>
          <span className="ml-3">$29.99</span>
        </p>
        <p className="text-sm text-gray-500">Limited Time Offer</p>
      </div>
      
      <Button
        onClick={onPurchase}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity group"
      >
        {isAuthenticated ? (
          <>
            Unlock Your Full Report Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        ) : (
          "Sign In to Purchase"
        )}
      </Button>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          30-day money-back guarantee
        </p>
        <p className="text-xs text-gray-400">
          Join thousands who have transformed their approach to ethical decision-making
        </p>
      </div>
    </div>
  );
};