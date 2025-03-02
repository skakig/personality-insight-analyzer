
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardHeader,
  CardTitle, 
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AdminSectionProps {
  userId: string;
}

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

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
      if (isNaN(amount) || amount <= 0 || amount > 100) {
        toast({
          title: "Error",
          description: "Discount must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('coupons')
        .insert({
          code: couponCode.toUpperCase(),
          discount_type: 'percentage',
          discount_amount: amount,
          is_active: true,
          max_uses: 100,
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Coupon code (e.g. SAVE50)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Discount percentage (e.g. 50)"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
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
              'Create Coupon'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
