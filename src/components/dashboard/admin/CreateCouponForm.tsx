
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CreateCouponFormProps {
  userId: string;
  onCouponCreated: () => void;
}

export const CreateCouponForm = ({ userId, onCouponCreated }: CreateCouponFormProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [maxUses, setMaxUses] = useState("100");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  
  // Product-specific options
  const [applicableProducts, setApplicableProducts] = useState<string[]>([]);
  
  // Handle product selection
  const toggleProduct = (product: string) => {
    setApplicableProducts(current => 
      current.includes(product)
        ? current.filter(p => p !== product)
        : [...current, product]
    );
  };

  const generateRandomCode = () => {
    const prefix = "TMH";
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    setCouponCode(`${prefix}${randomChars}${randomNumbers}`);
  };

  const createCoupon = async () => {
    try {
      setCreatingCoupon(true);
      
      // Validate inputs
      if (!couponCode || !discountAmount) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
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

      // Prepare date values if provided
      let startTimestamp = null;
      if (startDate) {
        startTimestamp = new Date(startDate).toISOString();
      }
      
      let expiryTimestamp = null;
      if (expiryDate) {
        expiryTimestamp = new Date(expiryDate).toISOString();
      }

      const { error } = await supabase
        .from('coupons')
        .insert({
          code: couponCode.toUpperCase(),
          discount_type: discountType,
          discount_amount: amount,
          max_uses: uses,
          is_active: true,
          created_by: userId,
          starts_at: startTimestamp,
          expires_at: expiryTimestamp,
          applicable_products: applicableProducts.length > 0 ? applicableProducts : null
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
      setStartDate("");
      setExpiryDate("");
      setApplicableProducts([]);
      
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
      
      <div className="space-y-2 bg-gray-50 p-4 rounded-md">
        <div className="flex gap-2">
          <Input
            placeholder="Coupon code (e.g. SAVE50)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={generateRandomCode}
            type="button"
          >
            Generate
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={discountType} 
            onValueChange={setDiscountType}
          >
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            placeholder={discountType === 'percentage' ? "Discount %" : "Discount amount (cents)"}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Input
          type="number"
          placeholder="Maximum uses"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="startDate" className="text-xs font-medium">
              Start Date (Optional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                className="pl-8"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="expiryDate" className="text-xs font-medium">
              Expiry Date (Optional)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="expiryDate"
                type="date"
                className="pl-8"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium">Applicable Products:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assessment" 
                checked={applicableProducts.includes('assessment')}
                onCheckedChange={() => toggleProduct('assessment')}
              />
              <Label htmlFor="assessment">Assessment Reports</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="book" 
                checked={applicableProducts.includes('book')}
                onCheckedChange={() => toggleProduct('book')}
              />
              <Label htmlFor="book">Book Pre-order</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="subscription" 
                checked={applicableProducts.includes('subscription')}
                onCheckedChange={() => toggleProduct('subscription')}
              />
              <Label htmlFor="subscription">Subscriptions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="credits" 
                checked={applicableProducts.includes('credits')}
                onCheckedChange={() => toggleProduct('credits')}
              />
              <Label htmlFor="credits">Assessment Credits</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Leave unchecked to apply to all products
          </p>
        </div>
        
        <Button 
          onClick={createCoupon} 
          disabled={creatingCoupon}
          className="w-full mt-2"
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
