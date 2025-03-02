
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CreateCouponFormProps {
  userId: string;
  onCouponCreated: () => void;
}

export const CreateCouponForm = ({ userId, onCouponCreated }: CreateCouponFormProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [maxUses, setMaxUses] = useState("100");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const createCoupon = async () => {
    try {
      setCreatingCoupon(true);
      
      // Validate inputs
      if (!couponCode || !discountAmount) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const amount = parseFloat(discountAmount);
      if (isNaN(amount) || amount <= 0 || (discountType === 'percentage' && amount > 100)) {
        toast({
          title: "Error",
          description: discountType === 'percentage' 
            ? "Discount percentage must be between 0 and 100" 
            : "Discount amount must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      const uses = parseInt(maxUses);
      if (isNaN(uses) || uses <= 0) {
        toast({
          title: "Error",
          description: "Maximum uses must be a positive number",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coupons')
        .insert({
          code: couponCode.toUpperCase(),
          discount_type: discountType,
          discount_amount: amount,
          max_uses: uses,
          is_active: true,
          created_by: userId
        });

      if (error) {
        console.error('Error creating coupon:', {
          error,
          userId,
          couponCode
        });
        throw error;
      }

      toast({
        title: "Success",
        description: `Coupon ${couponCode.toUpperCase()} created successfully!`,
      });

      // Reset form
      setCouponCode("");
      setDiscountAmount("");
      setDiscountType("percentage");
      setMaxUses("100");
      
      // Refresh coupons list
      onCouponCreated();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setCreatingCoupon(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Create New Coupon</h3>
      
      <div className="space-y-2">
        <Input
          placeholder="Coupon code (e.g. SAVE50)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        />
        
        <div className="flex gap-2">
          <Select 
            value={discountType} 
            onValueChange={setDiscountType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Discount Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            placeholder={discountType === 'percentage' ? "Discount percentage (e.g. 50)" : "Discount amount in cents (e.g. 500)"}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
          />
        </div>
        
        <Input
          type="number"
          placeholder="Maximum uses"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
        />
        
        <Button 
          onClick={createCoupon} 
          disabled={creatingCoupon}
          className="w-full"
        >
          {creatingCoupon ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Coupon
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
