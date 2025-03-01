
import { useState, useEffect } from "react";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { toast } from "@/components/ui/use-toast";

export const useCheckoutFlow = (session: any, quizResultId: string | null) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  const userId = session?.user?.id;
  
  const { loading: loggedInLoading, handleLoggedInCheckout } = useLoggedInCheckout(quizResultId, userId || "");
  const { loading: guestLoading, handleGuestCheckout } = useGuestCheckout(quizResultId);
  
  const loading = loggedInLoading || guestLoading;

  // Log important state changes
  useEffect(() => {
    console.log('Checkout flow initialized:', {
      isLoggedIn: !!userId,
      userId: userId || 'guest',
      quizResultId,
      timestamp: new Date().toISOString()
    });
  }, [userId, quizResultId]);

  const handleGetDetailedResults = async () => {
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
      userId: session?.user?.id || 'guest'
    });

    if (session?.user) {
      try {
        await handleLoggedInCheckout();
      } catch (error) {
        console.error('Error in logged-in checkout:', error);
        toast({
          title: "Checkout Error",
          description: "Could not process your request. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      setIsEmailDialogOpen(true);
    }
  };

  const handleGuestSubmit = async () => {
    try {
      const success = await handleGuestCheckout(email);
      if (success) {
        setIsEmailDialogOpen(false);
      }
    } catch (error) {
      console.error('Error in guest checkout:', error);
      toast({
        title: "Guest Checkout Error",
        description: "Could not process your request. Please try again later.",
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
