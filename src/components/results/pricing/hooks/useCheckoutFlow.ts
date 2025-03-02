
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { useCouponState, CouponState } from "./useCouponState";

export const useCheckoutFlow = (
  session: any, 
  quizResultId: string | null, 
  priceAmount: number = 1499, 
  couponCode?: string
) => {
  // Basic state 
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Initialize checkout hooks
  const { loading: loggedInLoading, handleCheckout: handleLoggedInCheckout } = useLoggedInCheckout();
  const { loading: guestLoading, handleCheckout: handleGuestCheckout } = useGuestCheckout();
  
  // Combined loading state
  const loading = loggedInLoading || guestLoading;
  
  // Use localStorage to retrieve previously used email if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('guestEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  
  const userId = session?.user?.id;
  
  // Simplified checkout handler for logged-in users
  const handleLoggedInCheckoutFlow = async () => {
    if (!userId) return false;
    
    return handleLoggedInCheckout({
      quizResultId,
      userId,
      email: session?.user?.email,
      priceAmount,
      couponCode
    });
  };
  
  // Simplified checkout handler for guests
  const handleGuestCheckoutFlow = async (guestEmail: string) => {
    return handleGuestCheckout({
      quizResultId,
      guestEmail,
      priceAmount,
      couponCode
    });
  };

  const handleGetDetailedResults = async () => {
    try {
      if (!quizResultId) {
        toast({
          title: "Error",
          description: "No assessment result found. Please try taking the assessment again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Get detailed results clicked:', {
        isLoggedIn: !!session?.user,
        userId: session?.user?.id || 'guest',
        quizResultId,
        priceAmount
      });

      // Double-check authentication status
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        console.log('Proceeding with logged-in checkout flow');
        await handleLoggedInCheckoutFlow();
      } else {
        console.log('Proceeding with guest checkout flow');
        // Check if we already have an email
        if (email) {
          // Skip dialog if email already provided
          await handleGuestCheckoutFlow(email);
        } else {
          setIsEmailDialogOpen(true);
        }
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Could not process your request. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleGuestSubmit = async () => {
    try {
      console.log('Submitting guest checkout with email:', email);
      const success = await handleGuestCheckoutFlow(email);
      if (success) {
        setIsEmailDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Guest checkout error:', error);
      toast({
        title: "Guest Checkout Error",
        description: error.message || "Could not process your request. Please try again later.",
        variant: "destructive",
      });
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
