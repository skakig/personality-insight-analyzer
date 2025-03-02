
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PurchaseCreditsButton = () => {
  const [loading, setLoading] = useState(false);

  const handlePurchaseCredits = async () => {
    try {
      setLoading(true);
      console.log('Initiating credits purchase...');
      
      // First check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('You must be logged in to purchase credits');
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          mode: 'payment',
          productType: 'credits',
          amount: 5, // Default to 5 credits
          userId: session.user.id,
          metadata: {
            productType: 'credits',
            amount: 5,
            userId: session.user.id,
            returnUrl: `${window.location.origin}/dashboard?success=true`
          }
        }
      });

      if (error) {
        console.error('Credits purchase error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to credits checkout URL:', data.url);
        
        // Store the session ID for verification after return
        if (data.sessionId) {
          localStorage.setItem('creditsPurchaseSessionId', data.sessionId);
          localStorage.setItem('checkoutUserId', session.user.id);
        }
        
        // Add a small delay to ensure any state updates are processed
        setTimeout(() => {
          window.location.href = data.url;
        }, 100);
      } else {
        console.error('No checkout URL received for credits purchase');
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Improved error messaging based on error type
      if (error.message?.includes('Edge Function') || error.status === 500) {
        toast({
          title: "Server Error",
          description: "Our payment service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
      } else if (error.message?.includes('policy for relation') || error.message?.includes('infinite recursion')) {
        toast({
          title: "Database Error",
          description: "We're experiencing a temporary database issue. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to initiate credit purchase. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePurchaseCredits}
      className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Purchase Additional Credits
        </>
      )}
    </Button>
  );
};
