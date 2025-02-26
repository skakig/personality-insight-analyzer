
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useCoupon } from "@/hooks/useCoupon";

interface CouponInputProps {
  onCouponApplied: (calculatedDiscount: {
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  }) => void;
  originalAmount: number;
  className?: string;
}

export const CouponInput = ({ onCouponApplied, originalAmount, className = "" }: CouponInputProps) => {
  const [code, setCode] = useState("");
  const { validateCoupon, calculateDiscount, validating, couponDetails, clearCoupon } = useCoupon();

  const handleApplyCoupon = async () => {
    const isValid = await validateCoupon(code);
    if (isValid) {
      const discount = calculateDiscount(originalAmount);
      if (discount) {
        onCouponApplied(discount);
      }
    }
  };

  const handleRemoveCoupon = () => {
    setCode("");
    clearCoupon();
    onCouponApplied({
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount
    });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={validating || !!couponDetails}
          className="flex-1"
        />
        {couponDetails ? (
          <Button 
            variant="destructive" 
            onClick={handleRemoveCoupon}
            className="whitespace-nowrap"
          >
            Remove Coupon
          </Button>
        ) : (
          <Button 
            onClick={handleApplyCoupon} 
            disabled={!code || validating}
            className="whitespace-nowrap"
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Apply Coupon'
            )}
          </Button>
        )}
      </div>
      {couponDetails && (
        <p className="text-sm text-green-600">
          Coupon applied: {couponDetails.discount_type === 'percentage' 
            ? `${couponDetails.discount_amount}% off` 
            : `$${couponDetails.discount_amount.toFixed(2)} off`}
        </p>
      )}
    </div>
  );
};
