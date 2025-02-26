
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CouponDetails {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'full';
  discount_amount: number;
  current_uses: number;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
}

interface CalculatedDiscount {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponDetails: CouponDetails;
}

export const useCoupon = () => {
  const [validating, setValidating] = useState(false);
  const [couponDetails, setCouponDetails] = useState<CouponDetails | null>(null);

  const validateCoupon = async (code: string): Promise<boolean> => {
    if (!code) {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return false;
    }

    try {
      setValidating(true);
      console.log('Validating coupon:', code);

      const { data: rawCoupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        console.error('Error validating coupon:', error);
        toast({
          title: "Invalid Coupon",
          description: "The coupon code you entered is invalid",
          variant: "destructive",
        });
        return false;
      }

      if (!rawCoupon) {
        toast({
          title: "Invalid Coupon",
          description: "The coupon code you entered is invalid",
          variant: "destructive",
        });
        return false;
      }

      // Validate discount_type
      if (!['percentage', 'fixed', 'full'].includes(rawCoupon.discount_type)) {
        console.error('Invalid discount type:', rawCoupon.discount_type);
        toast({
          title: "Invalid Coupon",
          description: "This coupon has an invalid discount type",
          variant: "destructive",
        });
        return false;
      }

      // Type assertion after validation
      const coupon: CouponDetails = {
        id: rawCoupon.id,
        code: rawCoupon.code,
        discount_type: rawCoupon.discount_type as 'percentage' | 'fixed' | 'full',
        discount_amount: rawCoupon.discount_amount,
        current_uses: rawCoupon.current_uses,
        max_uses: rawCoupon.max_uses,
        expires_at: rawCoupon.expires_at,
        is_active: rawCoupon.is_active
      };

      // Validation checks
      if (!coupon.is_active) {
        toast({
          title: "Inactive Coupon",
          description: "This coupon is no longer active",
          variant: "destructive",
        });
        return false;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Expired Coupon",
          description: "This coupon has expired",
          variant: "destructive",
        });
        return false;
      }

      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Usage Limit Reached",
          description: "This coupon has reached its usage limit",
          variant: "destructive",
        });
        return false;
      }

      setCouponDetails(coupon);
      toast({
        title: "Coupon Applied",
        description: "The coupon has been successfully applied",
      });
      return true;

    } catch (error) {
      console.error('Error in validateCoupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setValidating(false);
    }
  };

  const calculateDiscount = (amount: number): CalculatedDiscount | null => {
    if (!couponDetails) return null;

    let discountAmount = 0;
    
    switch (couponDetails.discount_type) {
      case 'percentage':
        discountAmount = (amount * couponDetails.discount_amount) / 100;
        break;
      case 'fixed':
        discountAmount = couponDetails.discount_amount;
        break;
      case 'full':
        discountAmount = amount;
        break;
    }

    // Ensure discount doesn't exceed original amount
    discountAmount = Math.min(discountAmount, amount);

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      originalAmount: amount,
      discountAmount,
      finalAmount,
      couponDetails
    };
  };

  const recordCouponUsage = async (
    couponId: string, 
    purchaseAmount: number, 
    discountAmount: number,
    userId?: string,
    guestEmail?: string
  ) => {
    try {
      console.log('Recording coupon usage:', {
        couponId,
        purchaseAmount,
        discountAmount,
        userId,
        guestEmail
      });

      // Insert usage record
      const { error: usageError } = await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          guest_email: guestEmail,
          purchase_amount: purchaseAmount,
          discount_amount: discountAmount
        });

      if (usageError) throw usageError;

      // Increment usage counter
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          current_uses: couponDetails!.current_uses + 1
        })
        .eq('id', couponId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error recording coupon usage:', error);
      // Don't throw - we don't want to break the purchase flow if usage recording fails
    }
  };

  return {
    validating,
    couponDetails,
    validateCoupon,
    calculateDiscount,
    recordCouponUsage,
    clearCoupon: () => setCouponDetails(null)
  };
};
