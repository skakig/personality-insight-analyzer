
import { useEffect, useState } from "react";
import { PriceDisplay } from "./pricing/PriceDisplay";
import { EmailDialog } from "./pricing/EmailDialog";
import { PricingFooter } from "./pricing/PricingFooter";
import { CheckoutButton } from "./pricing/CheckoutButton";
import { useCheckoutFlow } from "./pricing/hooks/useCheckoutFlow";
import { useCouponState } from "./pricing/hooks/useCouponState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { CouponInput } from "@/components/common/CouponInput";

interface PricingSectionProps {
  session: any;
  quizResultId: string | null;
}

export const PricingSection = ({ session, quizResultId }: PricingSectionProps) => {
  const [originalPrice] = useState(1499); // $14.99 in cents
  const { 
    appliedDiscount, 
    setAppliedDiscount, 
    calculateDiscountedPrice 
  } = useCouponState(originalPrice);
  
  const finalPrice = calculateDiscountedPrice(originalPrice);

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
    console.log('Coupon applied:', { discount, code, discountType });
    setAppliedDiscount({ amount: discount, code, type: discountType });
    
    // Show a success notification
    toast({
      title: "Coupon Applied",
      description: `${discountType === 'percentage' ? `${discount}% discount` : `$${(discount / 100).toFixed(2)} discount`} has been applied to your order.`
    });
  };

  // Remove coupon
  const handleCouponRemoved = () => {
    console.log('Coupon removed');
    setAppliedDiscount(null);
    
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed from your order."
    });
  };

  // Verify authentication state and handle Stripe return when component mounts
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
            description: "Your detailed report is now available."
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
              
              // Send a welcome email via edge function
              try {
                const userEmail = currentSession?.user?.email || localStorage.getItem('guestEmail');
                if (userEmail) {
                  await supabase.functions.invoke('send-results', {
                    body: { 
                      email: userEmail,
                      resultId: quizResultId
                    }
                  });
                  console.log('Sent result email to:', userEmail);
                }
              } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
              }
              
              // Subscribe to newsletter if user opted in
              const optedIn = localStorage.getItem('newsletterOptIn') === 'true';
              if (optedIn) {
                const userEmail = currentSession?.user?.email || localStorage.getItem('guestEmail');
                if (userEmail) {
                  try {
                    await supabase
                      .from('newsletter_subscribers')
                      .upsert({ email: userEmail }, { onConflict: 'email' });
                    console.log('Added email to newsletter:', userEmail);
                  } catch (newsletterError) {
                    console.error('Error adding to newsletter:', newsletterError);
                  }
                }
              }
            }
          } catch (updateError) {
            console.error('Error updating purchase status:', updateError);
          }
        } else if (urlParams.get('success') === 'false') {
          toast({
            title: "Purchase Cancelled",
            description: "Your purchase was not completed. You can try again when you're ready.",
            variant: "destructive",
          });
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
      
      <div className="mb-2">
        <label className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-primary focus:ring-primary"
            onChange={(e) => localStorage.setItem('newsletterOptIn', e.target.checked.toString())}
            defaultChecked={localStorage.getItem('newsletterOptIn') === 'true'}
          />
          <span>Subscribe to our newsletter for moral growth tips</span>
        </label>
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
