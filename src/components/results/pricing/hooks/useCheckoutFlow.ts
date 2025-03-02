import { useState } from "react";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { toast } from "@/hooks/use-toast";
import { validateEmail } from "@/utils/auth";

export const useCheckoutFlow = (
  session: any,
  quizResultId: string | null,
  priceAmount: number,
  couponCode?: string
) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  const { 
    loading: loggedInLoading, 
    handleCheckout: handleLoggedInCheckout 
  } = useLoggedInCheckout();
  
  const { 
    loading: guestLoading, 
    handleCheckout: handleGuestCheckout 
  } = useGuestCheckout();
  
  const loading = loggedInLoading || guestLoading;

  // Handle click on "Get Detailed Results" button
  const handleGetDetailedResults = async () => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "No assessment result found. Please try taking the assessment again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Initiating checkout flow:', {
      isAuthenticated: !!session?.user,
      quizResultId,
      priceAmount,
      hasCoupon: !!couponCode
    });
    
    // If user is logged in, proceed with logged-in checkout
    if (session?.user) {
      console.log('Proceeding with logged-in checkout');
      await handleLoggedInCheckout({
        quizResultId,
        userId: session.user.id,
        email: session.user.email,
        priceAmount,
        couponCode
      });
    } else {
      // Otherwise, show email dialog for guest checkout
      console.log('Opening email dialog for guest checkout');
      setIsEmailDialogOpen(true);
    }
  };

  // Handle guest email submission
  const handleGuestSubmit = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "No assessment result found. Please try taking the assessment again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Proceeding with guest checkout:', {
      email,
      quizResultId,
      priceAmount,
      hasCoupon: !!couponCode
    });
    
    const success = await handleGuestCheckout({
      quizResultId,
      guestEmail: email,
      priceAmount,
      couponCode
    });
    
    if (success) {
      setIsEmailDialogOpen(false);
    }
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
