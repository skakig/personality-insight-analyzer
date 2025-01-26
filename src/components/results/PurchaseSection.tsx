import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface PurchaseSectionProps {
  session: any;
}

export const PurchaseSection = ({ session }: PurchaseSectionProps) => {
  const navigate = useNavigate();

  const handleGetDetailedResults = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center pt-6">
      <div className="mb-8">
        <p className="text-3xl font-bold mb-2">
          <span className="text-primary line-through opacity-75">$49.99</span>
          <span className="ml-3">$29.99</span>
        </p>
        <p className="text-sm text-gray-500">Limited Time Offer</p>
      </div>
      
      <Button
        onClick={handleGetDetailedResults}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
      >
        {session ? "Get Your Full Report Now" : "Sign In to Purchase"}
      </Button>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-500">
          30-day money-back guarantee
        </p>
        <p className="text-xs text-gray-400">
          Your growth journey starts here. Join thousands of leaders who have transformed their approach to ethical decision-making.
        </p>
      </div>
    </div>
  );
};