
import { SubscriptionCard } from "./SubscriptionCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";
import { AdminSection } from "./AdminSection";
import { CouponStats } from "./CouponStats";
import { Assessment, Subscription } from "@/types/dashboard";
import { hasAnyPurchasedReport } from "@/utils/purchaseUtils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <SubscriptionCard subscription={subscription} error={error} />
        {previousAssessments.length > 0 && (
          <RecentAssessmentsCard 
            assessments={previousAssessments}
            subscription={subscription}
            hasAvailableCredits={hasAvailableCredits}
          />
        )}
        {isAdmin && <CouponStats />}
      </div>
      
      <div className="space-y-8">
        <QuickActionsCard 
          subscription={subscription} 
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
        {session?.user?.id && (
          <AdminSection userId={session.user.id} />
        )}
      </div>
    </div>
  );
};
