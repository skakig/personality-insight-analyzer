import { SubscriptionCard } from "./SubscriptionCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";

interface DashboardContentProps {
  subscription: any;
  error: string | null;
  previousAssessments: any[];
}

export const DashboardContent = ({ 
  subscription, 
  error, 
  previousAssessments 
}: DashboardContentProps) => {
  // Filter to get the most recent purchased assessment
  const hasPurchasedReport = previousAssessments.some(
    assessment => assessment.is_purchased || assessment.is_detailed
  );

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-8">
        <SubscriptionCard subscription={subscription} error={error} />
        {previousAssessments.length > 0 && (
          <RecentAssessmentsCard 
            assessments={previousAssessments}
            subscription={subscription}
          />
        )}
      </div>
      
      <div className="space-y-8">
        <QuickActionsCard 
          subscription={subscription} 
          hasPurchasedReport={hasPurchasedReport}
        />
      </div>
    </div>
  );
};