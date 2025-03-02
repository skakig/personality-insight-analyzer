
import { Session } from "@supabase/supabase-js";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { NoSubscriptionCard } from "./subscription/NoSubscriptionCard";
import { DashboardError } from "./content/DashboardError";
import { AdminPanel } from "./content/AdminPanel";
import { CreditsSection } from "./content/CreditsSection";
import { ReportUnlockHandler } from "./content/ReportUnlockHandler";
import { QuizResult } from "@/types/quiz";

interface DashboardContentProps {
  subscription: any;
  error: string | null;
  previousAssessments: QuizResult[];
  session: Session | null;
}

export const DashboardContent = ({
  subscription,
  error,
  previousAssessments,
  session
}: DashboardContentProps) => {
  // Calculate if user has any purchased reports
  const hasPurchasedReport = previousAssessments.some(assessment => 
    assessment.is_purchased || assessment.is_detailed
  );
  
  // Calculate if user has available credits
  const hasAvailableCredits = subscription ? 
    subscription.assessments_used < subscription.max_assessments : false;

  // Check if user is admin to show admin panel
  const isAdmin = session?.user?.id === '32adf500-c102-4b14-a6a4-f8aa38f337c6';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <DashboardError error={error} />
        
        <ReportUnlockHandler session={session}>
          {({ purchaseLoading, handleUnlockReport }) => (
            <RecentAssessmentsCard 
              assessments={previousAssessments}
              onUnlockReport={handleUnlockReport}
              purchaseLoading={purchaseLoading}
            />
          )}
        </ReportUnlockHandler>
        
        <AdminPanel isAdmin={isAdmin} />
      </div>
      <div className="space-y-6">
        <QuickActionsCard 
          subscription={subscription}
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
        {subscription ? (
          <SubscriptionCard subscription={subscription} error={null} />
        ) : (
          <NoSubscriptionCard />
        )}
        <CreditsSection />
      </div>
    </div>
  );
};
