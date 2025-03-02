
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";

interface CreateCommissionTierFormProps {
  onCreateTier: (minSales: string, maxSales: string, commissionRate: string) => Promise<void>;
}

export const CreateCommissionTierForm = ({ onCreateTier }: CreateCommissionTierFormProps) => {
  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!minSales || !commissionRate) return;
    
    setCreating(true);
    try {
      await onCreateTier(minSales, maxSales, commissionRate);
      setMinSales("");
      setMaxSales("");
      setCommissionRate("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Create Commission Tier</h3>
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min Sales ($)"
            value={minSales}
            onChange={(e) => setMinSales(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Sales ($, optional)"
            value={maxSales}
            onChange={(e) => setMaxSales(e.target.value)}
          />
        </div>
        <Input
          type="number"
          placeholder="Commission Rate (%)"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={creating || !minSales || !commissionRate}
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Tier
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
