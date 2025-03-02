
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

interface CouponUsage {
  id: string;
  coupon_code: string;
  used_at: string;
  user_id: string | null;
  guest_email: string | null;
  purchase_amount: number;
  discount_amount: number;
}

export const CouponStats = () => {
  const [loading, setLoading] = useState(true);
  const [couponUsage, setCouponUsage] = useState<CouponUsage[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchCouponStats();
  }, []);

  const fetchCouponStats = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('coupon_usage')
        .select(`
          id,
          used_at,
          user_id,
          guest_email,
          purchase_amount,
          discount_amount,
          coupons!inner (
            code
          )
        `)
        .order('used_at', { ascending: false });

      if (error) throw error;

      // Transform data to include coupon code directly
      const transformedData = data.map(item => ({
        id: item.id,
        coupon_code: item.coupons.code,
        used_at: item.used_at,
        user_id: item.user_id,
        guest_email: item.guest_email,
        purchase_amount: item.purchase_amount,
        discount_amount: item.discount_amount
      }));

      setCouponUsage(transformedData);

      // Calculate totals
      const saved = data.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
      const revenue = data.reduce((sum, item) => sum + (item.purchase_amount || 0), 0);
      
      setTotalSaved(saved);
      setTotalRevenue(revenue);
    } catch (error: any) {
      console.error('Error fetching coupon stats:', error);
      toast({
        title: "Error",
        description: "Failed to load coupon statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupon Analytics</CardTitle>
        <CardDescription>Track coupon usage and effectiveness</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Discounts</div>
                <div className="text-2xl font-bold">${(totalSaved / 100).toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Recent Coupon Usage</h3>
              
              {couponUsage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No coupon usage data available yet.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="py-2 px-4 text-left text-sm font-medium">Code</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">User</th>
                        <th className="py-2 px-4 text-left text-sm font-medium">Date</th>
                        <th className="py-2 px-4 text-right text-sm font-medium">Amount</th>
                        <th className="py-2 px-4 text-right text-sm font-medium">Discount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {couponUsage.slice(0, 10).map((usage) => (
                        <tr key={usage.id}>
                          <td className="py-2 px-4 text-sm font-medium">{usage.coupon_code}</td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">
                            {usage.user_id ? 'User' : usage.guest_email || 'Guest'}
                          </td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">
                            {format(parseISO(usage.used_at), 'MMM d, yyyy')}
                          </td>
                          <td className="py-2 px-4 text-sm text-right">
                            ${(usage.purchase_amount / 100).toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-sm text-right text-green-600">
                            -${(usage.discount_amount / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
