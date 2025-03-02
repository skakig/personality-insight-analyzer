
import { Affiliate } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AffiliatePerformanceCardProps {
  affiliate: Affiliate;
}

export const AffiliatePerformanceCard = ({ affiliate }: AffiliatePerformanceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/20 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Affiliate Code</p>
            <p className="text-2xl font-bold mt-1">{affiliate.code}</p>
          </div>
          <div className="bg-secondary/20 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold mt-1">${affiliate.total_sales.toFixed(2)}</p>
          </div>
          <div className="bg-secondary/20 p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold mt-1">${affiliate.earnings.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
