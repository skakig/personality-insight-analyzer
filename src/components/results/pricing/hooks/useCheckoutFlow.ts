
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useLoggedInCheckout } from "./useLoggedInCheckout";
import { useGuestCheckout } from "./useGuestCheckout";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Store result ID in localStorage for guest users
    if (quizResultId && !session?.user) {
      localStorage.setItem('guestQuizResultId', quizResultId);
    }
    
    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true' && quizResultId) {
      console.log('[DEBUG] Detected success=true in URL, checking purchase status for:', quizResultId);
      
      // Attempt to directly fetch and check the result
      const checkPurchaseStatus = async () => {
        try {
          const { data: result } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('id', quizResultId)
            .maybeSingle();
            
          console.log('[DEBUG] Current result status:', {
            id: result?.id,
            is_purchased: result?.is_purchased,
            purchase_status: result?.purchase_status,
            hasSessionId: !!result?.stripe_session_id
          });
          
          // If not purchased, try to update it
          if (result && !result.is_purchased) {
            const sessionId = urlParams.get('session_id') || localStorage.getItem('stripeSessionId');
            
            if (sessionId) {
              console.log('[DEBUG] Updating purchase with session ID:', sessionId);
              
              const { error: updateError } = await supabase
                .from('quiz_results')
                .update({
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase'
                })
                .eq('id', quizResultId);
                
              if (updateError) {
                console.error('[ERROR] Error updating purchase status:', updateError);
              } else {
                console.log('[DEBUG] Successfully updated purchase status');
                window.location.reload(); // Refresh to show updated UI
              }
            }
          }
        } catch (error) {
          console.error('[ERROR] Error checking purchase status:', error);
        }
      };
      
      checkPurchaseStatus();
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
      
      // For logged in users, process directly
      if (session?.user) {
        console.log('[DEBUG] Processing as logged in user with ID:', session.user.id);
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
