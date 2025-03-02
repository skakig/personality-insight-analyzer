
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

export interface CreateCouponFormProps {
  onCouponCreated: () => void;
}

export const CreateCouponForm = ({ onCouponCreated }: CreateCouponFormProps) => {
  const session = useSession();
  const userId = session?.user?.id;
  
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateCode = () => {
    setIsGenerating(true);
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCode(result);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      if (!code) {
        throw new Error("Coupon code is required");
      }

      if (!discountAmount) {
        throw new Error("Discount amount is required");
      }

      const numericDiscount = Number(discountAmount);

      if (discountType === "percentage" && (numericDiscount <= 0 || numericDiscount > 100)) {
        throw new Error("Percentage discount must be between 1 and 100");
      }

      if (discountType === "fixed" && numericDiscount <= 0) {
        throw new Error("Fixed discount must be greater than 0");
      }

      // Insert the coupon into the database
      const { data, error } = await supabase
        .from('coupons')
        .insert([
          {
            code,
            discount_type: discountType,
            discount_amount: numericDiscount,
            max_uses: maxUses || null,
            expires_at: expiresAt ? expiresAt.toISOString() : null,
            is_active: true,
            created_by: userId
          }
        ]);

      if (error) {
        throw error;
      }

      // Show success
      setSuccess(true);
      
      // Reset form
      setCode("");
      setDiscountType("percentage");
      setDiscountAmount("");
      setMaxUses("");
      setExpiresAt(undefined);
      
      // Notify parent component
      onCouponCreated();
      
      toast({
        title: "Coupon created",
        description: `Coupon code ${code} has been created successfully.`,
      });
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error creating coupon",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700 text-sm">Coupon created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">Coupon Code</label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1"
                placeholder="e.g. SUMMER25"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCode}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="discount-type" className="text-sm font-medium">Discount Type</label>
            <Select
              value={discountType}
              onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}
            >
              <SelectTrigger id="discount-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="discount-amount" className="text-sm font-medium">
              {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
            </label>
            <div className="relative">
              <Input
                id="discount-amount"
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : "")}
                className="pr-8"
                min="0"
                max={discountType === "percentage" ? "100" : undefined}
                step="0.01"
                placeholder={discountType === "percentage" ? "25" : "10.00"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {discountType === "percentage" ? "%" : "$"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="max-uses" className="text-sm font-medium">Maximum Uses</label>
            <Input
              id="max-uses"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : "")}
              min="1"
              placeholder="Unlimited"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="expires-at" className="text-sm font-medium">Expiration Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-4">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Coupon"
          )}
        </Button>
      </form>
    </div>
  );
};
