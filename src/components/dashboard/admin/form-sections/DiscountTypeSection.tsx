
import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiscountTypeSectionProps {
  discountType: "percentage" | "fixed";
  setDiscountType: Dispatch<SetStateAction<"percentage" | "fixed">>;
}

export const DiscountTypeSection = ({
  discountType,
  setDiscountType,
}: DiscountTypeSectionProps) => {
  return (
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
  );
};
