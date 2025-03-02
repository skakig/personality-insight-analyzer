
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { storePurchaseData } from "@/utils/purchaseStateUtils";

export const useCheckoutFlow = (
  session: any, 
  quizResultId: string | null, 
  priceAmount: number = 1499, 
  couponCode?: string
) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use localStorage to retrieve previously used email if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('guestEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  
  const userId = session?.user?.id;
  
  // Simplified checkout handler for logged-in users
  const handleLoggedInCheckout = async () => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "No assessment result found. Please try taking the assessment again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Starting logged-in checkout flow for result:', quizResultId, 'with price:', priceAmount);
      
      // Create checkout session via Supabase function
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId: quizResultId,
            userId,
            email: session?.user?.email,
            priceAmount: priceAmount,
            couponCode: couponCode,
            metadata: {
              resultId: quizResultId,
              userId,
              couponCode,
              returnUrl: `/assessment/${quizResultId}?success=true`
            }
          }
        }
      );
      
      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Error creating checkout session');
      }
      
      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }
      
      // Store information for verification after return
      if (data.sessionId) {
        // Store purchase data
        storePurchaseData(quizResultId, data.sessionId, userId);
        
        // Update result with session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);

        // Track coupon usage (if a coupon was applied)
        if (couponCode) {
          try {
            // First get the coupon ID
            const { data: couponData } = await supabase
              .from('coupons')
              .select('id, current_uses')
              .eq('code', couponCode)
              .single();
              
            if (couponData) {
              // Increment coupon usage counter
              await supabase
                .from('coupons')
                .update({ 
                  current_uses: (couponData.current_uses || 0) + 1 
                })
                .eq('id', couponData.id);
              
              // Record coupon usage
              await supabase
                .from('coupon_usage')
                .insert({
                  coupon_id: couponData.id,
                  user_id: userId || null,
                  guest_email: !userId ? session?.user?.email || email : null,
                  purchase_amount: priceAmount,
                  discount_amount: data.discountAmount || 0
                });
            }
          } catch (couponError) {
            console.error('Error tracking coupon usage:', couponError);
            // Continue with checkout even if coupon tracking fails
          }
        }
      }
      
      // Redirect to Stripe
      console.log('Redirecting to Stripe checkout URL:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Logged-in checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Could not process your checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  // Simplified checkout handler for guests
  const handleGuestCheckout = async (guestEmail: string) => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "No assessment result found. Please try taking the assessment again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // Validate email
      if (!guestEmail || !guestEmail.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return false;
      }
      
      console.log('Starting guest checkout flow for result:', quizResultId, 'with email:', guestEmail, 'price:', priceAmount);
      
      // Store email for future use
      localStorage.setItem('guestEmail', guestEmail);
      
      // Create a guest access token
      const accessToken = crypto.randomUUID();
      
      // Update the quiz result with guest email and token
      await supabase
        .from('quiz_results')
        .update({ 
          guest_email: guestEmail,
          guest_access_token: accessToken,
          guest_access_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .eq('id', quizResultId);
      
      // Create purchase tracking record first to ensure we can recover the result ID
      const { data: trackingData, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: quizResultId,
          guest_email: guestEmail,
          status: 'pending',
          stripe_session_id: null, // Will be updated after checkout creation
        })
        .select()
        .single();
        
      if (trackingError) {
        console.error('Error creating purchase tracking:', trackingError);
        // Continue anyway - not critical for the main flow
      }
      
      // Create checkout session
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            resultId: quizResultId,
            email: guestEmail,
            priceAmount: priceAmount,
            couponCode: couponCode,
            metadata: {
              resultId: quizResultId,
              email: guestEmail,
              accessToken,
              couponCode,
              trackingId: trackingData?.id, // Include tracking ID if available
              returnUrl: `/assessment/${quizResultId}?success=true`
            }
          }
        }
      );
      
      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || 'Error creating checkout session');
      }
      
      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }
      
      // Store information for verification after return
      if (data.sessionId) {
        // Store purchase data
        storePurchaseData(quizResultId, data.sessionId);
        localStorage.setItem('guestAccessToken', accessToken);
        
        // Update tracking information
        if (trackingData?.id) {
          await supabase
            .from('purchase_tracking')
            .update({ stripe_session_id: data.sessionId })
            .eq('id', trackingData.id);
        }
        
        // Update quiz result with session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);

        // Track coupon usage (if a coupon was applied)
        if (couponCode) {
          try {
            // First get the coupon ID
            const { data: couponData } = await supabase
              .from('coupons')
              .select('id, current_uses')
              .eq('code', couponCode)
              .single();
              
            if (couponData) {
              // Increment coupon usage counter
              await supabase
                .from('coupons')
                .update({ 
                  current_uses: (couponData.current_uses || 0) + 1 
                })
                .eq('id', couponData.id);
              
              // Record coupon usage
              await supabase
                .from('coupon_usage')
                .insert({
                  coupon_id: couponData.id,
                  user_id: null,
                  guest_email: guestEmail,
                  purchase_amount: priceAmount,
                  discount_amount: data.discountAmount || 0
                });
            }
          } catch (couponError) {
            console.error('Error tracking coupon usage:', couponError);
            // Continue with checkout even if coupon tracking fails
          }
        }
      }
      
      // Redirect to Stripe
      console.log('Redirecting to Stripe checkout URL:', data.url);
      window.location.href = data.url;
      return true;
      
    } catch (error: any) {
      console.error('Guest checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Could not process your checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
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
        await handleLoggedInCheckout();
      } else {
        console.log('Proceeding with guest checkout flow');
        // Check if we already have an email
        if (email) {
          // Skip dialog if email already provided
          await handleGuestCheckout(email);
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
      setLoading(false);
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
      setLoading(false);
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
