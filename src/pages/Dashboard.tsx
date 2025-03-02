
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { usePurchaseHandler } from "@/hooks/dashboard/usePurchaseHandler";

export interface DashboardProps {
  session: Session | null;
}

const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, subscription, error, previousAssessments, fetchData } = useDashboardData(session);
  const { handlePurchaseStatus } = usePurchaseHandler(session, fetchData);

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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DashboardHeader subscription={subscription} />
        <DashboardContent 
          subscription={subscription}
          error={error}
          previousAssessments={previousAssessments}
          session={session}
        />
      </div>
    </div>
  );
};

export default Dashboard;
