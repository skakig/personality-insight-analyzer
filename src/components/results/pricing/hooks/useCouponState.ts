
import { useState } from "react";

export interface CouponState {
  appliedDiscount: {
    amount: number;
    code: string;
    type: string;
    applicableProducts?: string[];
  } | null;
  setAppliedDiscount: (discount: { 
    amount: number; 
    code: string; 
    type: string;
    applicableProducts?: string[];
  } | null) => void;
  calculateDiscountedPrice: (originalPrice: number, productType?: string) => number;
  isValidForProduct: (productType: string) => boolean;
}

export const useCouponState = (originalPrice: number = 1499): CouponState => {
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    code: string;
    type: string;
    applicableProducts?: string[];
  } | null>(null);

  const calculateDiscountedPrice = (originalPrice: number, productType?: string): number => {
    if (!appliedDiscount) return originalPrice;
    
    // Check if coupon is applicable to this product
    if (productType && appliedDiscount.applicableProducts && 
        appliedDiscount.applicableProducts.length > 0 && 
        !appliedDiscount.applicableProducts.includes(productType)) {
      return originalPrice; // Coupon not valid for this product
    }
    
    console.log('Calculating discount:', {
      originalPrice,
      discountType: appliedDiscount.type,
      discountAmount: appliedDiscount.amount,
      productType
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

  // Helper function to check if a coupon is valid for a specific product
  const isValidForProduct = (productType: string): boolean => {
    if (!appliedDiscount) return false;
    
    if (!appliedDiscount.applicableProducts || appliedDiscount.applicableProducts.length === 0) {
      return true; // Coupon applies to all products
    }
    
    return appliedDiscount.applicableProducts.includes(productType);
  };

  return {
    appliedDiscount,
    setAppliedDiscount,
    calculateDiscountedPrice,
    isValidForProduct
  };
};
