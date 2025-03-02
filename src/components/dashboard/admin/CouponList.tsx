
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { Coupon, CouponListProps } from "./types";
import { Badge } from "@/components/ui/badge";

export const CouponList = ({ coupons, onCouponUpdated, loading }: CouponListProps) => {
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
      onCouponUpdated();
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
      onCouponUpdated();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  // Helper function to show formatted product badges
  const getProductBadges = (products: string[] | null) => {
    if (!products || products.length === 0) {
      return <Badge variant="outline">All Products</Badge>;
    }
    
    const productColors: Record<string, string> = {
      assessment: "bg-blue-100 text-blue-800",
      book: "bg-purple-100 text-purple-800",
      subscription: "bg-green-100 text-green-800",
      credits: "bg-amber-100 text-amber-800"
    };
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {products.map(product => (
          <Badge key={product} variant="outline" className={productColors[product] || ""}>
            {product.charAt(0).toUpperCase() + product.slice(1)}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Active Coupons</h3>
      
      {loading ? (
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
              <div className="flex justify-between items-start">
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
                    {coupon.is_active && coupon.expires_at && new Date(coupon.expires_at) < new Date() && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Expired
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
                    {coupon.expires_at && ` • Expires: ${format(parseISO(coupon.expires_at), 'MMM d, yyyy')}`}
                  </div>
                  {getProductBadges(coupon.applicable_products)}
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
  );
};
