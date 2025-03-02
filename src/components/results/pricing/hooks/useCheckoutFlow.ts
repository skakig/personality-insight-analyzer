import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { supabase } from "@/integrations/supabase/client";

export const useCheckoutFlow = (session: any, quizResultId: string | null, finalPrice: number, couponCode?: string) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Initialize checkout methods
  const { loading: loggedInLoading, handleCheckout: handleLoggedInCheckout } = useLoggedInCheckout();
  const { loading: guestLoading, handleCheckout: handleGuestCheckout } = useGuestCheckout();
  
  const loading = loggedInLoading || guestLoading;
  
  // Set initial email from session if available
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      const storedEmail = localStorage.getItem('guestEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [session]);

  /**
   * Main function to handle detailed results checkout
   */
  const handleGetDetailedResults = async () => {
    try {
      // For logged in users, process directly
      if (session?.user) {
        console.log('Processing as logged in user with ID:', session.user.id);
        
        const success = await handleLoggedInCheckout({
          quizResultId,
          userId: session.user.id,
          email: session.user.email,
          priceAmount: finalPrice,
          couponCode
        });
        
        if (!success) {
          console.error('Logged-in checkout failed');
          toast({
            title: "Checkout Error",
            description: "Unable to process your purchase. Please try again.",
            variant: "destructive",
          });
        }
        
        return;
      }
      
      // For guest users, open email dialog
      console.log('Processing as guest user, opening email dialog');
      setIsEmailDialogOpen(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle guest user email submission
   */
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Processing guest checkout with email:', email);
    
    const success = await handleGuestCheckout({
      quizResultId,
      guestEmail: email,
      priceAmount: finalPrice,
      couponCode
    });
    
    if (!success) {
      console.error('Guest checkout failed');
      toast({
        title: "Checkout Error",
        description: "Unable to process your purchase. Please try again.",
        variant: "destructive",
      });
    }
    
    // Keep dialog open until redirect happens
  };

  return {
    email,
    setEmail,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    loading,
    handleGetDetailedResults,
    handleGuestSubmit
  };
};
