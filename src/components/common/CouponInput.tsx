
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CouponInputProps {
  onCouponApplied: (discount: number, code: string, discountType: string) => void;
  onCouponRemoved: () => void;
  disabled?: boolean;
}

export const CouponInput = ({ onCouponApplied, onCouponRemoved, disabled = false }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
  } | null>(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    try {
      setValidatingCoupon(true);
      
      // Fetch coupon from database
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error validating coupon:', error);
        throw new Error('Failed to validate coupon');
      }

      if (!coupon) {
        toast({
          title: "Invalid Coupon",
          description: "This coupon code doesn't exist or has expired",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Coupon Expired",
          description: "This coupon has reached its maximum usage limit",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon is expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Coupon Expired",
          description: "This coupon has expired",
          variant: "destructive",
        });
        return;
      }

      // Valid coupon
      const appliedCouponData = {
        code: coupon.code,
        discount: coupon.discount_amount,
        discountType: coupon.discount_type
      };
      
      setAppliedCoupon(appliedCouponData);
      onCouponApplied(coupon.discount_amount, coupon.code, coupon.discount_type);
      
      toast({
        title: "Coupon Applied!",
        description: `${coupon.discount_amount}% discount applied to your purchase`,
      });
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponRemoved();
    toast({
      title: "Coupon Removed",
      description: "Discount has been removed",
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        {!appliedCoupon ? (
          <>
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={disabled || validatingCoupon}
              className="uppercase"
            />
            <Button 
              variant="outline" 
              onClick={handleValidateCoupon}
              disabled={disabled || validatingCoupon || !couponCode.trim()}
            >
              {validatingCoupon ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full p-2 border rounded-md bg-muted/20">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{appliedCoupon.code}</span>
              <span className="text-sm text-muted-foreground">
                ({appliedCoupon.discount}% discount)
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveCoupon}
              disabled={disabled}
            >
              <XCircle className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
