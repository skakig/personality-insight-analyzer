
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAdminOperations } from "./admin/useAdminOperations";
import { CreateCouponForm } from "./admin/CreateCouponForm";
import { CouponList } from "./admin/CouponList";
import { AdminSectionProps } from "./admin/types";

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const { 
    isAdmin, 
    loading, 
    coupons, 
    loadingCoupons, 
    fetchCoupons 
  } = useAdminOperations(userId);

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
        <CreateCouponForm 
          userId={userId} 
          onCouponCreated={fetchCoupons} 
        />
        
        <CouponList 
          coupons={coupons} 
          onCouponUpdated={fetchCoupons} 
          loading={loadingCoupons} 
        />
      </CardContent>
    </Card>
  );
};
