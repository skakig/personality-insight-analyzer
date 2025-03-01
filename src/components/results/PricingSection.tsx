
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { supabase } from "@/integrations/supabase/client";

interface PricingSectionProps {
  session: any;
  quizResultId: string | null;
}

export const PricingSection = ({ session, quizResultId }: PricingSectionProps) => {
  const [email, setEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetDetailedResults = async () => {
    if (!quizResultId) {
      toast({
        title: "Error",
        description: "Unable to process your purchase. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (session?.user) {
        console.log('Processing logged-in user checkout:', {
          userId: session.user.id,
          resultId: quizResultId,
          timestamp: new Date().toISOString()
        });

        // Create purchase tracking record
        const { data: tracking, error: trackingError } = await supabase
          .from('purchase_tracking')
          .insert({
            quiz_result_id: quizResultId,
            user_id: session.user.id,
            status: 'pending',
            stripe_session_id: null
          })
          .select()
          .single();

        if (trackingError) {
          console.error('Error creating purchase tracking:', trackingError);
          throw new Error('Failed to prepare checkout. Please try again.');
        }

        // Update quiz result with pending status
        await supabase
          .from('quiz_results')
          .update({ 
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', quizResultId);

        // Store information for verification after return
        localStorage.setItem('purchaseTrackingId', tracking.id);
        localStorage.setItem('purchaseResultId', quizResultId);
        
        // Create Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { 
            resultId: quizResultId,
            priceAmount: 1499,
            mode: 'payment',
            metadata: {
              userId: session.user.id,
              resultId: quizResultId,
              trackingId: tracking.id,
              returnUrl: `/assessment/${quizResultId}?success=true`
            }
          }
        });

        if (error) {
          console.error('Checkout error:', error);
          throw error;
        }
        
        if (!data?.url) {
          console.error('No checkout URL received');
          throw new Error('No checkout URL received');
        }

        // Store the Stripe session ID for verification
        if (data.sessionId) {
          // Update purchase tracking record
          await supabase
            .from('purchase_tracking')
            .update({ 
              stripe_session_id: data.sessionId 
            })
            .eq('id', tracking.id);
          
          // Update quiz result with stripe session
          await supabase
            .from('quiz_results')
            .update({ 
              stripe_session_id: data.sessionId
            })
            .eq('id', quizResultId);

          // Store session ID in localStorage
          localStorage.setItem('stripeSessionId', data.sessionId);
        }

        // Add a small delay to ensure data is saved before redirecting
        setTimeout(() => {
          window.location.href = data.url;
        }, 100);
      } else {
        setIsEmailDialogOpen(true);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGuestCheckout = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue with the purchase.",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const guestAccessToken = localStorage.getItem('guestAccessToken') || crypto.randomUUID();
      
      // Create purchase tracking record for guest
      const { data: tracking, error: trackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: quizResultId,
          guest_email: email,
          status: 'pending',
          access_token: guestAccessToken || null
        })
        .select()
        .single();

      if (trackingError) {
        console.error('Error creating guest purchase tracking:', trackingError);
      } else {
        localStorage.setItem('purchaseTrackingId', tracking.id);
      }
      
      // Update quiz result with guest information
      await supabase
        .from('quiz_results')
        .update({ 
          guest_email: email,
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending',
          guest_access_token: guestAccessToken,
          guest_access_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .eq('id', quizResultId);

      // Save guest email for later verification
      localStorage.setItem('guestEmail', email);
      localStorage.setItem('purchaseResultId', quizResultId || '');
      localStorage.setItem('guestAccessToken', guestAccessToken);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          resultId: quizResultId,
          email,
          priceAmount: 1499,
          metadata: {
            isGuest: true,
            email,
            tempAccessToken: guestAccessToken,
            resultId: quizResultId,
            trackingId: tracking?.id,
            returnUrl: `/assessment/${quizResultId}?success=true`
          }
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      // Store the Stripe session ID if available
      if (data.sessionId) {
        localStorage.setItem('stripeSessionId', data.sessionId);
        
        // Update the quiz result with the session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId 
          })
          .eq('id', quizResultId);
      }

      // Add a small delay to ensure data is saved before redirecting
      setTimeout(() => {
        window.location.href = data.url;
      }, 100);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsEmailDialogOpen(false);
    }
  };

  return (
    <div className="text-center pt-6">
      <PriceDisplay originalPrice="$29.99" discountedPrice="$14.99" />
      
      <Button
        onClick={handleGetDetailedResults}
        className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Get Your Full Report Now'}
      </Button>
      
      <PricingFooter />

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleGuestCheckout}
        loading={loading}
      />
    </div>
  );
};
