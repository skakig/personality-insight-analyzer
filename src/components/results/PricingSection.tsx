
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PricingSectionProps {
  session: any;
}

export const PricingSection = ({ session }: PricingSectionProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetDetailedResults = async () => {
    if (session) {
      // If user is logged in, proceed with regular checkout
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
    } else {
      // If user is not logged in, open email dialog
      setIsEmailDialogOpen(true);
    }
  };

  const handleGuestCheckout = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue with the purchase.",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-guest-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          priceAmount: 1499, // $14.99 in cents
        }),
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
    } finally {
      setLoading(false);
      setIsEmailDialogOpen(false);
    }
  };

  return (
    <div className="text-center pt-6">
      <div className="mb-8">
        <p className="text-3xl font-bold mb-2">
          <span className="text-primary line-through opacity-75">$29.99</span>
          <span className="ml-3">$14.99</span>
        </p>
        <p className="text-sm text-gray-500">Limited Time Offer</p>
      </div>
      
      <Button
        onClick={handleGetDetailedResults}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        disabled={loading}
      >
        Get Your Full Report Now
      </Button>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-500">
          30-day money-back guarantee
        </p>
        <p className="text-xs text-gray-400">
          Your growth journey starts here. Join thousands of leaders who have transformed their approach to ethical decision-making.
        </p>
      </div>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your email to continue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              onClick={handleGuestCheckout}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Continue to Checkout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
