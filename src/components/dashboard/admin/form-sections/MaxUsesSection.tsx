
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";

interface MaxUsesSectionProps {
  maxUses: number | "" | undefined;
  setMaxUses: Dispatch<SetStateAction<number | "" | undefined>>;
}

export const MaxUsesSection = ({
  maxUses,
  setMaxUses,
}: MaxUsesSectionProps) => {
  return (
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
  );
};
