
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { supabase } from "@/integrations/supabase/client";

interface PricingSectionProps {
  session: any;
  quizResultId: string | null;
}

export const PricingSection = ({ session, quizResultId }: PricingSectionProps) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetDetailedResults = async () => {
    if (session?.user) {
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { 
            resultId: quizResultId,
            priceAmount: 1499,
            mode: 'payment',
            metadata: {
              userId: session.user.id
            }
          }
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No checkout URL received');
        
        window.location.href = data.url;
      } catch (error: any) {
        console.error('Error:', error);
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
      const guestAccessToken = localStorage.getItem('guestAccessToken');
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId: quizResultId,
          email,
          priceAmount: 1499,
          metadata: {
            isGuest: true,
            email,
            tempAccessToken: guestAccessToken
          }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
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
