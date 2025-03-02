
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponList } from "../CouponList";
import { CreateCouponForm } from "../CreateCouponForm";
import { supabase } from "@/integrations/supabase/client";
import { CouponStats } from "../../CouponStats";
import { toast } from "@/hooks/use-toast";

export function CouponManagement() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCoupons();
  }, []);
  
  // Stats calculations
  const activeCoupons = coupons.filter(coupon => coupon.is_active).length;
  const totalCoupons = coupons.length;
  const expiredCoupons = coupons.filter(coupon => 
    coupon.expires_at && new Date(coupon.expires_at) < new Date()
  ).length;
  
  // Usage stats
  const totalUsed = coupons.reduce((sum, coupon) => sum + (coupon.current_uses || 0), 0);
  const totalAvailable = coupons.reduce((sum, coupon) => {
    if (!coupon.max_uses) return sum; // Unlimited
    return sum + (coupon.max_uses - (coupon.current_uses || 0));
  }, 0);
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Coupon Management</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CouponStats 
          statTitle="Active Coupons" 
          statValue={activeCoupons.toString()} 
          statDescription="Currently active coupon codes"
          trend={activeCoupons > totalCoupons / 2 ? "up" : "neutral"}
        />
        <CouponStats 
          statTitle="Total Coupons" 
          statValue={totalCoupons.toString()} 
          statDescription="All coupon codes created"
          trend="neutral"
        />
        <CouponStats 
          statTitle="Expired Coupons" 
          statValue={expiredCoupons.toString()} 
          statDescription="Coupons past expiration date"
          trend={expiredCoupons > totalCoupons / 3 ? "down" : "neutral"}
        />
        <CouponStats 
          statTitle="Redemptions" 
          statValue={totalUsed.toString()} 
          statDescription="Total coupon redemptions"
          trend={totalUsed > 0 ? "up" : "neutral"}
        />
      </div>
      
      <Tabs defaultValue="manage">
        <TabsList className="mb-6">
          <TabsTrigger value="manage">Manage Coupons</TabsTrigger>
          <TabsTrigger value="create">Create Coupon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading coupons...</p>
              ) : (
                <CouponList 
                  coupons={coupons} 
                  onCouponUpdated={fetchCoupons}
                  loading={loading} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateCouponForm onCouponCreated={fetchCoupons} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
