
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
    
    if (appliedDiscount.type === 'percentage') {
      const discountedAmount = Math.round(originalPrice * (appliedDiscount.amount / 100));
      return Math.max(0, originalPrice - discountedAmount);
    } else if (appliedDiscount.type === 'fixed') {
      // For fixed amount discounts (in cents)
      return Math.max(0, originalPrice - appliedDiscount.amount);
    }
    
    return originalPrice;
  };

  return {
    appliedDiscount,
    setAppliedDiscount,
    calculateDiscountedPrice
  };
};
