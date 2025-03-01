
import { useState, useEffect } from "react";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCheckoutFlow = (session: any, quizResultId: string | null) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Use localStorage to retrieve previously used email if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('guestEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  
  const userId = session?.user?.id;
  
  const { loading: loggedInLoading, handleLoggedInCheckout } = useLoggedInCheckout(quizResultId, userId || "");
  const { loading: guestLoading, handleGuestCheckout } = useGuestCheckout(quizResultId);
  
  const loading = loggedInLoading || guestLoading;

  // Log important state changes for debugging
  useEffect(() => {
    console.log('Checkout flow initialized:', {
      isLoggedIn: !!userId,
      userId: userId || 'guest',
      quizResultId,
      sessionValid: !!session,
      timestamp: new Date().toISOString()
    });
  }, [userId, quizResultId, session]);

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
        quizResultId
      });

      // Double-check authentication status
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        console.log('Proceeding with logged-in checkout flow');
        await handleLoggedInCheckout();
      } else {
        console.log('Proceeding with guest checkout flow');
        // Check if we already have an email
        if (email) {
          // Skip dialog if email already provided
          await handleGuestSubmit();
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
      const success = await handleGuestCheckout(email);
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
