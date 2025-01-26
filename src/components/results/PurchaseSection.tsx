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
      <p className="text-2xl font-bold mb-4">
        Special Introductory Price: <span className="text-primary">$9.99</span>
      </p>
      <Button
        onClick={handleGetDetailedResults}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
      >
        {session ? "Get Your Full Report Now" : "Sign In to Purchase"}
      </Button>
      <p className="text-sm text-gray-500 mt-4">
        30-day money-back guarantee. Your growth journey starts here.
      </p>
    </div>
  );
};