
import { useState, useEffect } from "react";
import { SubscriptionCard } from "./SubscriptionCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";
import { AdminSection } from "./AdminSection";
import { CouponStats } from "./CouponStats";
import { Assessment, Subscription } from "@/types/dashboard";
import { hasAnyPurchasedReport } from "@/utils/purchaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardContentProps {
  subscription: Subscription | null;
  error: string | null;
  previousAssessments: Assessment[];
  session: any;
}

export const DashboardContent = ({ 
  subscription, 
  error, 
  previousAssessments,
  session
}: DashboardContentProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const hasPurchasedReport = hasAnyPurchasedReport(previousAssessments);

  const hasAvailableCredits = subscription?.active && 
    subscription?.assessments_used < subscription?.max_assessments;

  // Check if user is admin when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      checkAdminStatus(session.user.id);
    }
  }, [session]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-12">
      {/* Admin section - only visible for admins */}
      {isAdmin && (
        <div className="md:col-span-12 mb-4">
          <Card className="bg-gray-50 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded mr-2">Admin</span>
                Administrator Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Access admin features to manage your platform, including coupons, affiliates, and system settings.
                  </p>
                  {session?.user?.id && (
                    <AdminSection userId={session.user.id} />
                  )}
                </div>
                {isAdmin && <CouponStats />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="md:col-span-8 space-y-8">
        <SubscriptionCard subscription={subscription} error={error} />
        {previousAssessments.length > 0 && (
          <RecentAssessmentsCard 
            assessments={previousAssessments}
            subscription={subscription}
            hasAvailableCredits={hasAvailableCredits}
          />
        )}
      </div>
      
      <div className="md:col-span-4 space-y-8">
        <QuickActionsCard 
          subscription={subscription} 
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
      </div>
    </div>
  );
};
