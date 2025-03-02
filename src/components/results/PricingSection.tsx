
import { useEffect, useState } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { CheckoutButton } from "./pricing/CheckoutButton";
import { useCheckoutFlow } from "./pricing/hooks/useCheckoutFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { CouponInput } from "@/components/common/CouponInput";

interface PricingSectionProps {
  session: any;
  quizResultId: string | null;
}

export const PricingSection = ({ session, quizResultId }: PricingSectionProps) => {
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    code: string;
    type: string;
  } | null>(null);
  const [originalPrice] = useState(1499); // $14.99 in cents
  const [finalPrice, setFinalPrice] = useState(originalPrice);

  const {
    email,
    setEmail,
    isEmailDialogOpen,
    setIsEmailDialogOpen,
    loading,
    handleGetDetailedResults,
    handleGuestSubmit
  } = useCheckoutFlow(session, quizResultId, finalPrice, appliedDiscount?.code);

  // Apply coupon discount
  const handleCouponApplied = (discount: number, code: string, discountType: string) => {
    setAppliedDiscount({ amount: discount, code, type: discountType });
    
    // Calculate price based on discount type
    if (discountType === 'percentage') {
      const discountedAmount = Math.round(originalPrice * (discount / 100));
      setFinalPrice(originalPrice - discountedAmount);
    } else if (discountType === 'fixed') {
      // For fixed amount discounts (in cents)
      setFinalPrice(Math.max(0, originalPrice - discount));
    }
  };

  // Remove coupon
  const handleCouponRemoved = () => {
    setAppliedDiscount(null);
    setFinalPrice(originalPrice);
  };

  // Verify authentication state when component mounts
  useEffect(() => {
    const verifyAuthState = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('PricingSection authentication check:', {
          hasSession: !!session,
          hasCurrentSession: !!currentSession,
          hasQuizResultId: !!quizResultId,
          userId: currentSession?.user?.id || session?.user?.id || 'guest',
          timestamp: new Date().toISOString()
        });
        
        // Check if this is a return from Stripe with success=true
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success') === 'true';
        
        if (success && quizResultId) {
          toast({
            title: "Purchase Successful!",
            description: "Your detailed report is now available.",
          });
          
          // Handle successful purchase return
          console.log('Detected successful return from Stripe checkout');
          
          // Let's update the purchase status directly
          try {
            const sessionId = localStorage.getItem('stripeSessionId');
            
            if (sessionId) {
              await supabase
                .from('quiz_results')
                .update({ 
                  is_purchased: true,
                  is_detailed: true,
                  purchase_status: 'completed',
                  purchase_completed_at: new Date().toISOString(),
                  access_method: 'purchase'
                })
                .eq('id', quizResultId);
              
              console.log('Successfully updated purchase status');
            }
          } catch (updateError) {
            console.error('Error updating purchase status:', updateError);
          }
        }
      } catch (error) {
        console.error('Error checking authentication state:', error);
      }
    };
    
    verifyAuthState();
  }, [session, quizResultId]);

  // Format prices for display
  const formattedOriginalPrice = `$${(originalPrice / 100).toFixed(2)}`;
  const formattedFinalPrice = `$${(finalPrice / 100).toFixed(2)}`;
  
  // Show original price if discount applied, otherwise null
  const displayOriginalPrice = appliedDiscount ? formattedOriginalPrice : null;

  return (
    <div className="text-center pt-6 space-y-4">
      <PriceDisplay 
        originalPrice={displayOriginalPrice} 
        discountedPrice={formattedFinalPrice} 
      />
      
      <div className="max-w-md mx-auto px-4">
        <CouponInput 
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
          disabled={loading}
        />
      </div>
      
      <CheckoutButton 
        onClick={handleGetDetailedResults}
        loading={loading}
      />
      
      <PricingFooter />

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleGuestSubmit}
        loading={loading}
      />
    </div>
  );
};
