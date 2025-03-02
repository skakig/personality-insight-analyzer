
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card, 
  CardHeader,
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";

interface AdminSectionProps {
  userId: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [maxUses, setMaxUses] = useState("100");
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      if (!userId) {
        console.error('No user ID provided to AdminSection');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Checking admin status for user:', userId);

      // First try using the is_admin database function
      const { data: isAdminResult, error: funcError } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      if (funcError) {
        console.error('Error checking admin status with RPC:', funcError);
        // Fall back to direct query if RPC fails
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking admin status:', {
            error,
            userId
          });
          throw error;
        }

        const hasAdminAccess = !!data;
        console.log('Admin status result (direct query):', {
          userId,
          isAdmin: hasAdminAccess
        });
        
        setIsAdmin(hasAdminAccess);
      } else {
        console.log('Admin status result (RPC):', {
          userId,
          isAdmin: isAdminResult
        });
        
        setIsAdmin(!!isAdminResult);
      }
    } catch (error: any) {
      console.error('Error in checkAdminStatus:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      
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
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoadingCoupons(false);
    }
  };

  const createCoupon = async () => {
    try {
      setCreatingCoupon(true);
      
      // Validate inputs
      if (!couponCode || !discountAmount) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const amount = parseFloat(discountAmount);
      if (isNaN(amount) || amount <= 0 || (discountType === 'percentage' && amount > 100)) {
        toast({
          title: "Error",
          description: discountType === 'percentage' 
            ? "Discount percentage must be between 0 and 100" 
            : "Discount amount must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      const uses = parseInt(maxUses);
      if (isNaN(uses) || uses <= 0) {
        toast({
          title: "Error",
          description: "Maximum uses must be a positive number",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coupons')
        .insert({
          code: couponCode.toUpperCase(),
          discount_type: discountType,
          discount_amount: amount,
          max_uses: uses,
          is_active: true,
          created_by: userId
        });

      if (error) {
        console.error('Error creating coupon:', {
          error,
          userId,
          couponCode
        });
        throw error;
      }

      toast({
        title: "Success",
        description: `Coupon ${couponCode.toUpperCase()} created successfully!`,
      });

      // Reset form
      setCouponCode("");
      setDiscountAmount("");
      setDiscountType("percentage");
      setMaxUses("100");
      
      // Refresh coupons list
      fetchCoupons();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setCreatingCoupon(false);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Coupon ${currentStatus ? 'disabled' : 'enabled'} successfully`,
      });
      
      // Refresh coupons
      fetchCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      
      // Refresh coupons
      fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // For debugging purposes - show even when not admin but comment out in production
  console.log('User admin status:', { userId, isAdmin });

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
        <CardDescription>Create and manage discount coupons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Create New Coupon</h3>
          
          <div className="space-y-2">
            <Input
              placeholder="Coupon code (e.g. SAVE50)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            
            <div className="flex gap-2">
              <Select 
                value={discountType} 
                onValueChange={setDiscountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Discount Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder={discountType === 'percentage' ? "Discount percentage (e.g. 50)" : "Discount amount in cents (e.g. 500)"}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            
            <Input
              type="number"
              placeholder="Maximum uses"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
            
            <Button 
              onClick={createCoupon} 
              disabled={creatingCoupon}
              className="w-full"
            >
              {creatingCoupon ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Coupon
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Active Coupons</h3>
          
          {loadingCoupons ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No coupons found. Create your first coupon above.
            </p>
          ) : (
            <div className="space-y-2">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className={`border rounded-lg p-3 ${!coupon.is_active ? 'bg-muted/20' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{coupon.code}</span>
                        {!coupon.is_active && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Disabled
                          </span>
                        )}
                        {coupon.is_active && coupon.current_uses >= coupon.max_uses && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Maxed Out
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_amount}% off` 
                          : `$${(coupon.discount_amount / 100).toFixed(2)} off`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Uses: {coupon.current_uses} / {coupon.max_uses} • 
                        Created: {format(parseISO(coupon.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={coupon.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      >
                        {coupon.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
