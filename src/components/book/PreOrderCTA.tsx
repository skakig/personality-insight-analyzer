
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PreOrderCTA = () => {
  const [loading, setLoading] = useState(false);

  const handlePreOrder = async () => {
    try {
      setLoading(true);
      
      console.log('Initiating book pre-order checkout');
      
      const { data, error } = await supabase.functions.invoke('create-book-checkout', {
        method: 'POST',
        body: { 
          successUrl: `${window.location.origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/book?canceled=true`
        }
      });
      
      if (error) {
        console.error('Error invoking create-book-checkout:', error);
        throw new Error(error.message);
      }

      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('Failed to create checkout session');
      }
      
      console.log('Redirecting to Stripe checkout:', data.url);
      
      // Store session ID in localStorage for verification on return
      if (data.sessionId) {
        localStorage.setItem('stripeSessionId', data.sessionId);
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Pre-order error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Moral Journey?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Pre-order "The Moral Hierarchy" today and be one of the first to receive this life-changing guide.
          </p>
          <Button 
            size="lg" 
            onClick={handlePreOrder} 
            disabled={loading}
            className="pre-order-button"
          >
            {loading ? "Processing..." : "Pre-Order Now - $24.99"}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
