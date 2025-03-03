
import { Session } from "@supabase/supabase-js";
import { RecentAssessmentsCard } from "@/components/dashboard/RecentAssessmentsCard";
import { DashboardError } from "@/components/dashboard/content/DashboardError";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { CreditsSection } from "@/components/dashboard/content/CreditsSection";
import { SubscriptionAlert } from "@/components/dashboard/subscription/SubscriptionAlert";
import { useState } from "react";
import { QuizResult } from "@/types/quiz";

interface DashboardContentProps {
  subscription: any;
  error: string | null;
  previousAssessments: QuizResult[];
  session: Session | null;
  currentPage?: number;
  totalPages?: number;
  searchQuery?: string;
  itemsPerPage?: number;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  paginatedAssessments?: QuizResult[];
}

export const DashboardContent = ({
  subscription,
  error,
  previousAssessments,
  session,
  currentPage = 1,
  totalPages = 1,
  searchQuery = "",
  itemsPerPage = 10,
  onSearch = () => {},
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  paginatedAssessments = []
}: DashboardContentProps) => {
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  const handleUnlockReport = (reportId: string) => {
    setPurchaseLoading(reportId);
    // Here you would implement the unlock functionality
    // After the operation is complete, reset purchaseLoading
    setTimeout(() => {
      setPurchaseLoading(null);
    }, 1000);
  };

  const hasSubscription = subscription && subscription.active;
  const subscriptionProgress = hasSubscription 
    ? (subscription.assessments_used / subscription.max_assessments) * 100
    : 0;
  const hasAvailableCredits = hasSubscription && subscription.assessments_used < subscription.max_assessments;
  const hasPurchasedReport = previousAssessments.some(assessment => assessment.is_purchased);

  const assessmentsToShow = paginatedAssessments.length > 0 ? paginatedAssessments : previousAssessments;

  if (error) {
    return <DashboardError error={error} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <RecentAssessmentsCard 
          assessments={assessmentsToShow}
          onUnlockReport={handleUnlockReport}
          purchaseLoading={purchaseLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          itemsPerPage={itemsPerPage}
          onSearch={onSearch}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
      
      <div className="space-y-6">
        <SubscriptionCard 
          subscription={subscription} 
          error={error} 
        />
        {hasSubscription && (
          <SubscriptionAlert 
            assessmentsUsed={subscription.assessments_used}
            maxAssessments={subscription.max_assessments}
            progress={subscriptionProgress}
          />
        )}
        <QuickActionsCard 
          subscription={subscription}
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
        <CreditsSection />
      </div>
    </div>
  );
};
