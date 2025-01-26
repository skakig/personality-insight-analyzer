import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { LoadingState } from "@/components/dashboard/LoadingState";

interface DashboardProps {
  session: any;
}

const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousAssessments, setPreviousAssessments] = useState<any[]>([]);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('corporate_subscriptions')
          .select('*')
          .eq('organization_id', session.user.id)
          .maybeSingle();

        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
          setError('Failed to load subscription data');
        } else {
          setSubscription(subscriptionData);
        }

        // Fetch previous assessments
        const { data: assessments, error: assessmentsError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (assessmentsError) {
          console.error('Error fetching assessments:', assessmentsError);
          setError('Failed to load assessment history');
        } else {
          setPreviousAssessments(assessments || []);
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, navigate]);

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
        />
      </div>
    </div>
  );
};

export default Dashboard;