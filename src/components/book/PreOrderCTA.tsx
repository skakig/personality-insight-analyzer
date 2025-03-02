
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CouponInput } from "@/components/common/CouponInput";

export const PreOrderCTA = () => {
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discount: number;
    code: string;
    type: string;
  } | null>(null);
  
  const basePrice = 2999; // $29.99 in cents
  
  // Calculate final price with discount
  const calculatePrice = () => {
    if (!appliedCoupon) return basePrice;
    
    if (appliedCoupon.type === 'percentage') {
      const discountAmount = Math.round(basePrice * (appliedCoupon.discount / 100));
      return Math.max(0, basePrice - discountAmount);
    } else {
      return Math.max(0, basePrice - appliedCoupon.discount);
    }
  };
  
  const finalPrice = calculatePrice();
  const formattedPrice = `$${(finalPrice / 100).toFixed(2)}`;
  
  const handlePreOrder = async () => {
    try {
      setLoading(true);
      console.log('Starting pre-order process with coupon:', appliedCoupon?.code);
      
      const { data, error } = await supabase.functions.invoke('create-book-checkout', {
        body: {
          basePrice: basePrice,
          couponCode: appliedCoupon?.code || null,
          returnUrl: window.location.origin + '/book?success=true',
          cancelUrl: window.location.origin + '/book?canceled=true'
        }
      });
      
      if (error) {
        console.error('Pre-order error:', error);
        throw new Error(error.message || 'Failed to initiate checkout');
      }

      if (!data?.url) {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }
      
      console.log('Redirecting to checkout:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Coupon handlers
  const handleCouponApplied = (discount: number, code: string, discountType: string) => {
    console.log('Coupon applied:', { discount, code, discountType });
    setAppliedCoupon({
      discount,
      code,
      type: discountType
    });
    
    toast({
      title: "Coupon Applied",
      description: `${discountType === 'percentage' ? `${discount}% off` : `$${(discount / 100).toFixed(2)} off`} has been applied to your order`,
    });
  };
  
  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed from your order",
    });
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Secure Your Copy Today</h2>
          <p className="text-xl mb-8 text-white/90">
            Pre-order now and receive exclusive access to supplementary materials and exercises.
          </p>
          
          {appliedCoupon && (
            <div className="mb-4 bg-white/10 rounded-lg p-3 inline-block">
              <p className="text-sm">
                <span className="text-white/80">Original price:</span> <span className="line-through">${(basePrice / 100).toFixed(2)}</span>
              </p>
            </div>
          )}
          
          <div className="max-w-sm mx-auto mb-6">
            <CouponInput 
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              disabled={loading}
            />
          </div>
          
          <Button 
            size="lg"
            onClick={handlePreOrder}
            disabled={loading}
            className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 hover:text-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            {loading ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                Pre-order for {formattedPrice}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="mt-6 text-white/80">
            Limited time offer - Price will increase after launch
          </p>
        </motion.div>
      </div>
    </section>
  );
};
