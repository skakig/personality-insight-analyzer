
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EmailPurchaseDialog } from "./purchase/EmailPurchaseDialog";
import { toast } from "@/components/ui/use-toast";

interface PurchaseSectionProps {
  resultId: string;
  loading: boolean;
  priceId: string;
}

export const PurchaseSection = ({ resultId, loading, priceId }: PurchaseSectionProps) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!email) {
      setIsEmailDialogOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      // Create a guest purchase record
      const { error: guestError } = await supabase
        .from('guest_purchases')
        .insert({
          email,
          result_id: resultId,
          purchase_type: 'report'
        });

      if (guestError) throw guestError;
      
      const response = await supabase.functions.invoke('create-subscription', {
        body: { 
          priceId,
          email,
          mode: 'payment',
          metadata: {
            resultId,
            isGuest: true,
            email
          }
        }
      });

      if (response.error) throw response.error;
      
      if (!response.data?.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    handlePurchase();
    setIsEmailDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          <p className="text-3xl font-bold mb-2">
            <span className="text-primary line-through opacity-75">$29.99</span>
            <span className="ml-3">$14.99</span>
          </p>
          <p className="text-sm text-gray-500">Limited Time Offer</p>
        </div>

        <Button
          onClick={() => handlePurchase()}
          disabled={loading || isLoading}
          className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
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
      </div>

      <EmailPurchaseDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        setEmail={setEmail}
        onPurchase={handleEmailSubmit}
        loading={isLoading}
      />
    </div>
  );
};
