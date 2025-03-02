
import { useState } from "react";

export interface CouponState {
  appliedDiscount: {
    amount: number;
    code: string;
    type: string;
  } | null;
  setAppliedDiscount: (discount: { amount: number; code: string; type: string; } | null) => void;
  calculateDiscountedPrice: (originalPrice: number) => number;
}

export const useCouponState = (originalPrice: number = 1499): CouponState => {
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    code: string;
    type: string;
  } | null>(null);

  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (!appliedDiscount) return originalPrice;
    
    console.log('Calculating discount:', {
      originalPrice,
      discountType: appliedDiscount.type,
      discountAmount: appliedDiscount.amount
    });
    
    if (appliedDiscount.type === 'percentage') {
      const discountPercentage = appliedDiscount.amount / 100;
      const discountedAmount = Math.round(originalPrice * discountPercentage);
      const finalPrice = Math.max(0, originalPrice - discountedAmount);
      
      console.log('Percentage discount calculation:', {
        discountPercentage,
        discountedAmount,
        finalPrice
      });
      
      return finalPrice;
    } else if (appliedDiscount.type === 'fixed') {
      // For fixed amount discounts (in cents)
      const finalPrice = Math.max(0, originalPrice - appliedDiscount.amount);
      
      console.log('Fixed discount calculation:', {
        fixedDiscount: appliedDiscount.amount,
        finalPrice
      });
      
      return finalPrice;
    }
    
    return originalPrice;
  };

  return {
    appliedDiscount,
    setAppliedDiscount,
    calculateDiscountedPrice
  };
};
