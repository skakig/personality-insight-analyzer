
import { useAdminOperations } from "./admin/useAdminOperations";
import { AdminDashboard } from "./admin/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSectionProps } from "./admin/types";
import { Loader2, Settings, Users, Tag, BarChart } from "lucide-react";
import { useState } from "react";

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const { isAdmin, loading } = useAdminOperations(userId);
  const [expandedView, setExpandedView] = useState(false);

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

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Admin Controls</h2>
          <button 
            onClick={() => setExpandedView(!expandedView)}
            className="text-sm text-primary hover:underline"
          >
            {expandedView ? "Collapse" : "Expand"}
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Manage your site settings, data, coupons, and affiliate programs
        </p>
        
        <div className="grid gap-2">
          {expandedView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a 
                href="/dashboard/admin/coupons" 
                className="flex items-center p-3 rounded-md hover:bg-gray-100 border transition-colors"
              >
                <Tag className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">Coupon Management</span>
                  <span className="text-xs text-muted-foreground">Create and manage promotional codes</span>
                </div>
              </a>
              
              <a 
                href="/dashboard/admin/affiliates" 
                className="flex items-center p-3 rounded-md hover:bg-gray-100 border transition-colors"
              >
                <Users className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">Affiliate Program</span>
                  <span className="text-xs text-muted-foreground">Manage affiliates and commission tiers</span>
                </div>
              </a>
              
              <a 
                href="/dashboard/admin/analytics" 
                className="flex items-center p-3 rounded-md hover:bg-gray-100 border transition-colors"
              >
                <BarChart className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">Analytics & Reports</span>
                  <span className="text-xs text-muted-foreground">View sales and affiliate performance</span>
                </div>
              </a>
              
              <a 
                href="/dashboard/admin/settings" 
                className="flex items-center p-3 rounded-md hover:bg-gray-100 border transition-colors"
              >
                <Settings className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <span className="font-medium block">System Settings</span>
                  <span className="text-xs text-muted-foreground">Configure global application settings</span>
                </div>
              </a>
            </div>
          ) : (
            <a 
              href="/dashboard/admin/coupons" 
              className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">Open Admin Dashboard</span>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                Full Access
              </span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
