
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseHandler = (resultId: string) => {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [giftEmail, setGiftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true);
      console.log('Initiating checkout for result:', resultId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          priceAmount: 1499, // $14.99 in cents
          metadata: {
            resultId, // Explicitly include resultId in metadata
            isGuest: !session?.user
          }
        }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }
      
      if (!data?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout:', {
        resultId,
        checkoutUrl: data.url,
        timestamp: new Date().toISOString()
      });

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
    }
  };

  const handleGiftPurchase = async () => {
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

    try {
      setPurchaseLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          giftRecipientEmail: giftEmail,
          priceAmount: 1499, // $14.99 in cents
          metadata: {
            resultId,
            isGift: true,
            giftRecipientEmail: giftEmail
          }
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
    }
  };

  const handleEmailPurchase = async () => {
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

    try {
      setPurchaseLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId,
          mode: 'payment',
          email,
          priceAmount: 1499, // $14.99 in cents
          metadata: {
            resultId,
            isGuest: true,
            email
          }
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
      setIsEmailDialogOpen(false);
    }
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
