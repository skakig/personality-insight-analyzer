
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CouponList } from "../CouponList";
import { CreateCouponForm } from "../CreateCouponForm";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Loader2, PercentIcon, DollarSign, Users, ShoppingCart } from "lucide-react";

export const CouponManagement = () => {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountAmount: 0
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }

      setCoupons(data || []);
      
      // Calculate statistics
      const activeCoupons = data?.filter(coupon => coupon.is_active) || [];
      
      // Fetch coupon usage stats
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usage')
        .select('coupon_id, discount_amount');
        
      if (usageError) {
        console.error('Error fetching coupon usage:', usageError);
      }
      
      setStats({
        totalCoupons: data?.length || 0,
        activeCoupons: activeCoupons.length,
        totalRedemptions: usageData?.length || 0,
        totalDiscountAmount: usageData?.reduce((sum, item) => sum + (item.discount_amount || 0), 0) || 0
      });
      
    } catch (error: any) {
      toast({
        title: "Error fetching coupons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCouponCreated = () => {
    fetchCoupons();
  };

  const handleCouponUpdated = () => {
    fetchCoupons();
  };

  const handleCouponDeleted = () => {
    fetchCoupons();
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Coupon Management</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Coupons</p>
              <p className="text-2xl font-bold">{stats.totalCoupons}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <PercentIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Coupons</p>
              <p className="text-2xl font-bold">{stats.activeCoupons}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <PercentIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Redemptions</p>
              <p className="text-2xl font-bold">{stats.totalRedemptions}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Discount Amount</p>
              <p className="text-2xl font-bold">${(stats.totalDiscountAmount / 100).toFixed(2)}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Create New Coupon</h3>
          <CreateCouponForm onCouponCreated={handleCouponCreated} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Coupon List</h3>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <CouponList 
              coupons={coupons} 
              onCouponUpdated={handleCouponUpdated}
              onCouponDeleted={handleCouponDeleted}
            />
          )}
        </div>
      </div>
    </div>
  );
};
