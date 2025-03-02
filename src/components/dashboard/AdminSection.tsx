
import { useAdminOperations } from "./admin/useAdminOperations";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSectionProps } from "./admin/types";
import { Loader2 } from "lucide-react";

export const AdminSection = ({ userId }: AdminSectionProps) => {
  const { isAdmin, loading } = useAdminOperations(userId);

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
        <h2 className="text-xl font-semibold">Admin Controls</h2>
        <p className="text-sm text-muted-foreground mb-4">Manage your site settings and data</p>
        <div className="grid gap-2">
          <a 
            href="/dashboard/admin/coupons" 
            className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Open Admin Dashboard</span>
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              Full Access
            </span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
