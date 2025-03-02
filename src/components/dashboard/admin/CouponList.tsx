
import { useState } from "react";
import { format, isAfter } from "date-fns";
import { AlertCircle, Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Coupon } from "./types";

export interface CouponListProps {
  coupons: Coupon[];
  onCouponUpdated: () => void;
  loading: boolean;
}

export const CouponList = ({ coupons, onCouponUpdated, loading }: CouponListProps) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopySuccess(code);
        toast({
          title: "Copied!",
          description: `Coupon code ${code} copied to clipboard.`,
        });
        setTimeout(() => setCopySuccess(null), 3000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      onCouponUpdated();

      toast({
        title: coupon.is_active ? "Coupon deactivated" : "Coupon activated",
        description: `Coupon ${coupon.code} has been ${coupon.is_active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error: any) {
      console.error('Error updating coupon status:', error);
      toast({
        title: "Error updating coupon status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading coupon data...</div>;
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">No coupons found. Create your first coupon to get started.</p>
      </div>
    );
  }

  const isExpired = (expireDate: string | null) => {
    if (!expireDate) return false;
    return !isAfter(new Date(expireDate), new Date());
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-medium">{coupon.code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(coupon.code)}
                    >
                      {copySuccess === coupon.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_amount}%`
                    : `$${coupon.discount_amount.toFixed(2)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.current_uses || 0} / {coupon.max_uses || "∞"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {coupon.expires_at ? (
                    <span className={isExpired(coupon.expires_at) ? "text-red-500" : ""}>
                      {format(new Date(coupon.expires_at), "MMM d, yyyy")}
                      {isExpired(coupon.expires_at) && (
                        <AlertCircle className="inline-block ml-1 h-4 w-4 text-red-500" />
                      )}
                    </span>
                  ) : (
                    "Never"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isExpired(coupon.expires_at) ? (
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                      Expired
                    </Badge>
                  ) : coupon.is_active ? (
                    <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCouponStatus(coupon)}
                    className={coupon.is_active ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"}
                  >
                    {coupon.is_active ? (
                      <>
                        <X className="h-4 w-4 mr-1" /> Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Activate
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
