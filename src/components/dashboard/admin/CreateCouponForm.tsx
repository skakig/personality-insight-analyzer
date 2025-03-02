
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CodeInputSection } from "./form-sections/CodeInputSection";
import { DiscountTypeSection } from "./form-sections/DiscountTypeSection";
import { DiscountAmountSection } from "./form-sections/DiscountAmountSection";
import { MaxUsesSection } from "./form-sections/MaxUsesSection";
import { ExpirationDateSection } from "./form-sections/ExpirationDateSection";

export interface CreateCouponFormProps {
  onCouponCreated: () => void;
}

export const CreateCouponForm = ({ onCouponCreated }: CreateCouponFormProps) => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState<number | "">();
  const [maxUses, setMaxUses] = useState<number | "">();
  const [expiresAt, setExpiresAt] = useState<Date>();
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
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

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
          <CodeInputSection 
            code={code}
            setCode={setCode}
            generateCode={generateCode}
            isGenerating={isGenerating}
          />

          <DiscountTypeSection 
            discountType={discountType}
            setDiscountType={setDiscountType}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <DiscountAmountSection 
            discountType={discountType}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
          />

          <MaxUsesSection 
            maxUses={maxUses}
            setMaxUses={setMaxUses}
          />

          <ExpirationDateSection 
            expiresAt={expiresAt}
            setExpiresAt={setExpiresAt}
          />
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
