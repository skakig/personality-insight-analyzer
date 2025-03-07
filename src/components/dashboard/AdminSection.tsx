
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardHeader,
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [authEmail, setAuthEmail] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);

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

  const grantAssessmentAccess = async () => {
    try {
      setGrantingAccess(true);
      
      // Validate inputs
      if (!authEmail) {
        toast({
          title: "Error",
          description: "Please enter an email address",
          variant: "destructive",
        });
        return;
      }

      // Fix: Don't access protected properties directly
      const apiUrl = `${process.env.VITE_SUPABASE_URL || 'https://caebnpbdprrptogirxky.supabase.co'}/functions/v1/manual-authorize-assessment`;
      
      // Call the Supabase Edge Function to grant access
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZWJucGJkcHJycHRvZ2lyeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTcyODgsImV4cCI6MjA1MzQ5MzI4OH0.UWMAEN_06Ne2dAFDOS543B1C8K98GxCb0mQfFbWm7p8'}`
        },
        body: JSON.stringify({
          email: authEmail,
          adminId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to grant access');
      }

      toast({
        title: "Success",
        description: `Access granted for ${authEmail}!`,
      });

      // Reset form
      setAuthEmail("");
    } catch (error: any) {
      console.error('Error granting assessment access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant access",
        variant: "destructive",
      });
    } finally {
      setGrantingAccess(false);
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
        <CardDescription>Manage discounts and grant assessment access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="coupons">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="authorize">Authorize Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="coupons" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="authorize" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                Grant full assessment access to someone by email address
              </div>
              <Input
                placeholder="Email address"
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <Button 
                onClick={grantAssessmentAccess} 
                disabled={grantingAccess}
                className="w-full"
              >
                {grantingAccess ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting access...
                  </>
                ) : (
                  'Grant Full Access'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
