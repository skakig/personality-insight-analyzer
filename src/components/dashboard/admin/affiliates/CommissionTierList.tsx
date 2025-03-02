
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AffiliateCommissionTier } from "../types";

interface CommissionTierListProps {
  commissionTiers: AffiliateCommissionTier[];
  onRefresh: () => void;
}

export const CommissionTierList = ({ commissionTiers, onRefresh }: CommissionTierListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Commission Tiers</h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {commissionTiers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No commission tiers found. Create your first tier above.
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Min Sales</TableHead>
                <TableHead>Max Sales</TableHead>
                <TableHead>Commission Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionTiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell>${(tier.min_sales).toFixed(2)}</TableCell>
                  <TableCell>{tier.max_sales ? `$${(tier.max_sales).toFixed(2)}` : 'No limit'}</TableCell>
                  <TableCell>{(tier.commission_rate * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
