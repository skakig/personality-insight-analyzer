
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getStoredPurchaseData, storePurchaseData } from "@/utils/purchaseStateUtils";
import { updatePurchaseStatusDirectly } from "@/utils/purchase/verification/helpers/verificationCoordinator";

export const useCheckoutFlow = (session: any, quizResultId: string | null, finalPrice: number, couponCode?: string | null) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Initialize checkout methods
  const { loading: loggedInLoading, handleCheckout } = useLoggedInCheckout(quizResultId, couponCode);
  const { loading: guestLoading, handleGuestCheckout } = useGuestCheckout(
    quizResultId,
    email, 
    () => setIsEmailDialogOpen(false),
    couponCode
  );
  
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
    
    // Store result ID in localStorage for all users
    if (quizResultId) {
      console.log('[DEBUG] Storing quiz result ID in localStorage:', quizResultId);
      localStorage.setItem('guestQuizResultId', quizResultId);
      
      if (session?.user?.id) {
        localStorage.setItem('checkoutUserId', session.user.id);
      }
    }
    
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    
    if (success === 'true') {
      // Determine which result ID to use
      const storedData = getStoredPurchaseData();
      const resultIdToUse = quizResultId || storedData.resultId;
      const sessionIdToUse = sessionId || storedData.sessionId;
      
      console.log('[DEBUG] Detected success=true in URL, checking purchase status for:', {
        resultId: resultIdToUse,
        sessionId: sessionIdToUse
      });
      
      if (resultIdToUse && sessionIdToUse) {
        // Store the current result and session IDs
        storePurchaseData(resultIdToUse, sessionIdToUse, session?.user?.id);
        
        // Attempt to directly fetch and update the result
        updatePurchaseStatusDirectly(resultIdToUse, sessionIdToUse)
          .then(result => {
            if (result) {
              console.log('[DEBUG] Successfully updated purchase status, reloading page');
              toast({
                title: "Purchase complete!",
                description: "Your detailed report is now available.",
              });
              
              // Give a moment for the state to update
              setTimeout(() => {
                window.location.href = `/dashboard?resultId=${resultIdToUse}`;
              }, 500);
            } else {
              console.error('[ERROR] Failed to update purchase status directly');
              toast({
                title: "Verification in progress",
                description: "Please wait while we verify your purchase.",
              });
            }
          });
      } else {
        console.error('[ERROR] Missing result ID or session ID for verification');
        toast({
          title: "Verification error",
          description: "Could not verify your purchase. Please contact support.",
          variant: "destructive",
        });
      }
    }
  }, [session, quizResultId]);

  /**
   * Main function to handle detailed results checkout
   */
  const handleGetDetailedResults = async () => {
    try {
      console.log('[DEBUG] Starting checkout process with quiz result ID:', quizResultId);
      
      // Ensure we have a valid quiz result ID
      if (!quizResultId) {
        console.error('[ERROR] No quiz result ID available for checkout');
        toast({
          title: "Error",
          description: "Cannot process checkout - missing result information",
          variant: "destructive",
        });
        return;
      }
      
      // Store result ID in localStorage for all users
      localStorage.setItem('guestQuizResultId', quizResultId);
      localStorage.setItem('purchaseResultId', quizResultId);
      localStorage.setItem('checkoutResultId', quizResultId);
      
      // For logged in users, process directly
      if (session?.user) {
        console.log('[DEBUG] Processing as logged in user with ID:', session.user.id);
        localStorage.setItem('checkoutUserId', session.user.id);
        await handleCheckout();
        return;
      }
      
      // For guest users, open email dialog
      console.log('[DEBUG] Processing as guest user, opening email dialog');
      setIsEmailDialogOpen(true);
    } catch (error) {
      console.error('[ERROR] Checkout error:', error);
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
    
    // Store the email for later use
    localStorage.setItem('guestEmail', email);
    
    // Ensure quiz result ID is stored
    if (quizResultId) {
      localStorage.setItem('guestQuizResultId', quizResultId);
      localStorage.setItem('purchaseResultId', quizResultId);
      localStorage.setItem('checkoutResultId', quizResultId);
    }
    
    console.log('[DEBUG] Processing guest checkout with email:', email);
    await handleGuestCheckout();
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
