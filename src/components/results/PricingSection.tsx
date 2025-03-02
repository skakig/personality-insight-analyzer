
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
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";

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
    console.log('[DEBUG] Coupon applied:', { discount, code, discountType });
    setAppliedDiscount({ amount: discount, code, type: discountType });
    
    // Show a success notification
    toast({
      title: "Coupon Applied",
      description: `${discountType === 'percentage' ? `${discount}% discount` : `$${(discount / 100).toFixed(2)} discount`} has been applied to your order.`
    });
  };

  // Remove coupon
  const handleCouponRemoved = () => {
    console.log('[DEBUG] Coupon removed');
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
        console.log('[DEBUG] PricingSection mounted, checking state');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[DEBUG] PricingSection authentication check:', {
          hasSession: !!session,
          hasCurrentSession: !!currentSession,
          hasQuizResultId: !!quizResultId,
          userId: currentSession?.user?.id || session?.user?.id || 'guest',
          timestamp: new Date().toISOString()
        });
        
        // Check if this is a return from Stripe with success=true
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success') === 'true';
        const sessionId = urlParams.get('session_id');
        
        if (success && quizResultId) {
          console.log('[DEBUG] Detected successful return from Stripe checkout');
          
          // Store session ID from URL if present
          if (sessionId) {
            localStorage.setItem('stripeSessionId', sessionId);
          }
          
          // Try to verify the purchase with retry logic
          const verificationResult = await verifyPurchaseWithRetry(quizResultId);
          
          if (verificationResult) {
            console.log('[DEBUG] Purchase verification successful');
            
            toast({
              title: "Purchase Successful!",
              description: "Your detailed report is now available."
            });
            
            // Try to send results email
            try {
              const userEmail = currentSession?.user?.email || localStorage.getItem('guestEmail');
              if (userEmail) {
                await supabase.functions.invoke('send-results', {
                  body: { 
                    email: userEmail,
                    resultId: quizResultId
                  }
                });
                console.log('[DEBUG] Sent result email to:', userEmail);
              }
            } catch (emailError) {
              console.error('[ERROR] Error sending results email:', emailError);
            }
          } else {
            console.log('[DEBUG] Purchase verification failed, trying direct update');
            
            // Let's update the purchase status directly as a fallback
            try {
              const sessionId = localStorage.getItem('stripeSessionId');
              
              if (sessionId) {
                console.log('[DEBUG] Attempting direct update with session ID:', sessionId);
                
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
                
                console.log('[DEBUG] Successfully updated purchase status');
                
                toast({
                  title: "Purchase Successful!",
                  description: "Your detailed report is now available."
                });
                
                // Force page refresh to show updated UI
                window.location.reload();
              }
            } catch (updateError) {
              console.error('[ERROR] Error updating purchase status:', updateError);
              
              toast({
                title: "Purchase Verification Issue",
                description: "Please refresh the page to see your report.",
                variant: "destructive"
              });
            }
          }
        } else if (urlParams.get('success') === 'false') {
          toast({
            title: "Purchase Cancelled",
            description: "Your purchase was not completed. You can try again when you're ready.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('[ERROR] Error checking authentication state:', error);
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
