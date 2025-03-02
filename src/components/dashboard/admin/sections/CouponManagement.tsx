
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Coupon } from "../types";
import { toast } from "@/components/ui/use-toast";
import { CreateCouponForm } from "../CreateCouponForm";
import { CouponList } from "../CouponList";
import { CouponStats } from "../../CouponStats";

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our Coupon type
      const transformedCoupons = data.map(coupon => ({
        ...coupon,
        applicable_products: coupon.applicable_products || []
      })) as Coupon[];

      setCoupons(transformedCoupons);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error fetching coupons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Coupon Management</h2>
          <p className="text-muted-foreground mb-6">
            Create and manage discount coupons for your products.
          </p>

          <Tabs defaultValue="create">
            <TabsList className="mb-6">
              <TabsTrigger value="create">Create New Coupon</TabsTrigger>
              <TabsTrigger value="active">Active Coupons</TabsTrigger>
              <TabsTrigger value="stats">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <CreateCouponForm onCouponCreated={fetchCoupons} />
            </TabsContent>

            <TabsContent value="active">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <CouponList 
                  coupons={coupons}
                  onCouponUpdated={fetchCoupons}
                  loading={loading}
                />
              )}
            </TabsContent>

            <TabsContent value="stats">
              <CouponStats />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
