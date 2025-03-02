
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Edit } from "lucide-react";
import { Affiliate } from "../types";
import { Link } from "react-router-dom";

interface AffiliateListProps {
  affiliates: Affiliate[];
  onRefresh: () => void;
}

export const AffiliateList = ({ affiliates, onRefresh }: AffiliateListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Affiliate Partners</h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {affiliates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No affiliates found. Create your first affiliate partner above.
        </p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.name}</TableCell>
                  <TableCell>{affiliate.code}</TableCell>
                  <TableCell>{(affiliate.commission_rate * 100).toFixed(0)}%</TableCell>
                  <TableCell>${affiliate.total_sales.toFixed(2)}</TableCell>
                  <TableCell>${affiliate.earnings.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(affiliate.status)}>
                      {affiliate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/dashboard/admin/affiliates/${affiliate.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
