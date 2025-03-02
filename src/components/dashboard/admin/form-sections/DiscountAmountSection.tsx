
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";

interface DiscountAmountSectionProps {
  discountType: "percentage" | "fixed";
  discountAmount: number | "" | undefined;
  setDiscountAmount: Dispatch<SetStateAction<number | "" | undefined>>;
}

export const DiscountAmountSection = ({
  discountType,
  discountAmount,
  setDiscountAmount,
}: DiscountAmountSectionProps) => {
  return (
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
  );
};
