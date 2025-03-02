
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit, Check, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { Coupon } from "./types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CouponListProps {
  coupons: Coupon[];
  onCouponUpdated: () => void;
  loading: boolean;
  totalCoupons: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  couponFilter: 'all' | 'active' | 'inactive' | 'expired';
  setCouponFilter: (filter: 'all' | 'active' | 'inactive' | 'expired') => void;
}

export const CouponList = ({ 
  coupons, 
  onCouponUpdated, 
  loading,
  totalCoupons,
  page,
  pageSize,
  setPage,
  setPageSize,
  searchQuery,
  setSearchQuery,
  couponFilter,
  setCouponFilter
}: CouponListProps) => {
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      setProcessingId(couponId);
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
    } finally {
      setProcessingId(null);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      setProcessingId(couponId);
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
    } finally {
      setProcessingId(null);
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

  const totalPages = Math.ceil(totalCoupons / pageSize);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Coupon Management</h3>
        <div className="text-sm text-muted-foreground">
          {totalCoupons} {totalCoupons === 1 ? 'coupon' : 'coupons'} total
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={couponFilter}
          onValueChange={(value: any) => setCouponFilter(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coupons</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground mb-2">No coupons found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || couponFilter !== 'all' 
              ? "Try adjusting your search or filters" 
              : "Create your first coupon using the form above"}
          </p>
        </div>
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
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Disabled
                      </Badge>
                    )}
                    {coupon.is_active && coupon.current_uses >= coupon.max_uses && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Maxed Out
                      </Badge>
                    )}
                    {coupon.is_active && coupon.expires_at && new Date(coupon.expires_at) < new Date() && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_amount}% off` 
                      : `$${(coupon.discount_amount / 100).toFixed(2)} off`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Uses: {coupon.current_uses} / {coupon.max_uses === null ? '∞' : coupon.max_uses}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {coupon.starts_at && `Valid from: ${format(parseISO(coupon.starts_at), 'MMM d, yyyy')}`}
                    {coupon.starts_at && coupon.expires_at && ' • '}
                    {coupon.expires_at && `Expires: ${format(parseISO(coupon.expires_at), 'MMM d, yyyy')}`}
                  </div>
                  {getProductBadges(coupon.applicable_products)}
                </div>
                <div className="flex gap-2">
                  {processingId === coupon.id ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant={coupon.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      >
                        {coupon.is_active ? (
                          <X className="h-4 w-4 mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        {coupon.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCoupon(coupon.id === editingCoupon ? null : coupon.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {editingCoupon === coupon.id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm font-medium mb-2">Edit Coupon Options</div>
                  {/* Additional editing options would go here */}
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCoupon(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setPage(1); // Reset to first page when changing page size
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
