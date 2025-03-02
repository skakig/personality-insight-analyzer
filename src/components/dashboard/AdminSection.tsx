
import { Loader2 } from "lucide-react";
import { useAdminOperations } from "./admin/useAdminOperations";
import { AdminDashboard } from "./admin/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSectionProps } from "./admin/types";

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

  // For debugging purposes - show even when not admin but comment out in production
  console.log('User admin status:', { userId, isAdmin });

  if (!isAdmin) {
    return null;
  }

  return <AdminDashboard userId={userId} />;
};
