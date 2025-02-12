
import { SubscriptionCard } from "./SubscriptionCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";
import { Assessment, Subscription } from "@/types/dashboard";
import { hasAnyPurchasedReport } from "@/utils/purchaseUtils";

interface DashboardContentProps {
  subscription: Subscription | null;
  error: string | null;
  previousAssessments: Assessment[];
}

export const DashboardContent = ({ 
  subscription, 
  error, 
  previousAssessments 
}: DashboardContentProps) => {
  const hasPurchasedReport = hasAnyPurchasedReport(previousAssessments);

  const hasAvailableCredits = subscription?.active && 
    subscription?.assessments_used < subscription?.max_assessments;

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
      </div>
      
      <div className="space-y-8">
        <QuickActionsCard 
          subscription={subscription} 
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
      </div>
    </div>
  );
};
