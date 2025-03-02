
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Affiliate } from "../types";

interface AffiliateListProps {
  affiliates: Affiliate[];
  loading: boolean;
  onRefresh: () => void;
}

export const AffiliateList = ({ affiliates, loading, onRefresh }: AffiliateListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Active Affiliates</h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : affiliates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No affiliates found. Create your first affiliate above.
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.name}</TableCell>
                  <TableCell>{affiliate.code}</TableCell>
                  <TableCell>{(affiliate.commission_rate * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-right">${(affiliate.total_sales).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(affiliate.earnings).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
