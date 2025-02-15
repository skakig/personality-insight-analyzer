
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";

interface PricingSectionProps {
  session: any;
}

export const PricingSection = ({ session }: PricingSectionProps) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetDetailedResults = async () => {
    if (session) {
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
          priceAmount: 1499,
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
      <PriceDisplay originalPrice="$29.99" discountedPrice="$14.99" />
      
      <Button
        onClick={handleGetDetailedResults}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        disabled={loading}
      >
        Get Your Full Report Now
      </Button>
      
      <PricingFooter />

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleGuestCheckout}
        loading={loading}
      />
    </div>
  );
};
