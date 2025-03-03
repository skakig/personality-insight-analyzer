
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { usePurchaseHandler } from "@/hooks/dashboard/usePurchaseHandler";
import { RecentAssessmentsCard } from "@/components/dashboard/RecentAssessmentsCard";
import { DashboardError } from "@/components/dashboard/content/DashboardError";
import { CreditsSection } from "@/components/dashboard/content/CreditsSection";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { SubscriptionAlert } from "@/components/dashboard/subscription/SubscriptionAlert";

export interface DashboardProps {
  session: Session | null;
}

const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  
  const { 
    loading, 
    subscription, 
    error, 
    paginatedAssessments, 
    currentPage,
    totalPages,
    searchQuery,
    itemsPerPage,
    fetchData,
    searchAssessments,
    goToPage,
    changeItemsPerPage
  } = useDashboardData(session);
  
  const { handlePurchaseStatus } = usePurchaseHandler(session, fetchData);

  const handleUnlockReport = (reportId: string) => {
    setPurchaseLoading(reportId);
    // Here you would add the logic to unlock a report
    // After completion:
    setTimeout(() => {
      setPurchaseLoading(null);
    }, 1000);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      console.log('No valid session, redirecting to auth');
      navigate("/auth");
      return;
    }

    // Handle purchase success/failure notifications
    const success = searchParams.get('success');
    if (success) {
      handlePurchaseStatus(success);
    }
  }, [session, navigate, searchParams]);

  if (loading) {
    return <LoadingState />;
  }

  const hasSubscription = subscription && subscription.active;
  const subscriptionProgress = hasSubscription 
    ? (subscription.assessments_used / subscription.max_assessments) * 100
    : 0;
  const hasAvailableCredits = hasSubscription && subscription.assessments_used < subscription.max_assessments;
  const hasPurchasedReport = paginatedAssessments.some(assessment => assessment.is_purchased);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DashboardHeader subscription={subscription} />
        
        {error && <DashboardError error={error} />}
        
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <RecentAssessmentsCard 
                assessments={paginatedAssessments}
                onUnlockReport={handleUnlockReport}
                purchaseLoading={purchaseLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                searchQuery={searchQuery}
                itemsPerPage={itemsPerPage}
                onSearch={searchAssessments}
                onPageChange={goToPage}
                onItemsPerPageChange={changeItemsPerPage}
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
