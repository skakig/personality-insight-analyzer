
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseHandler = (resultId: string) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [giftEmail, setGiftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handlePurchase = async (giftRecipientEmail?: string, purchaseEmail?: string) => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating checkout for result:', resultId, giftRecipientEmail ? 'as gift' : '');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // For guest purchase, we need an email
        if (!purchaseEmail) {
          setIsEmailDialogOpen(true);
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          giftRecipientEmail,
          email: purchaseEmail,
          priceAmount: 1499 // $14.99 in cents
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(false);
      setIsGiftDialogOpen(false);
      setIsEmailDialogOpen(false);
    }
  };

  const handleGiftPurchase = () => {
    if (!giftEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    handlePurchase(giftEmail);
  };

  const handleEmailPurchase = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive the report.",
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

    handlePurchase(undefined, email);
  };

  return {
    purchaseLoading,
    giftEmail,
    setGiftEmail,
    email,
    setEmail,
    isGiftDialogOpen,
    setIsGiftDialogOpen,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    handlePurchase,
    handleGiftPurchase,
    handleEmailPurchase
  };
};
