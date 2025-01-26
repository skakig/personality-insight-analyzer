import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RecentAssessmentsCard } from "@/components/dashboard/RecentAssessmentsCard";
import { getSubscriptionTitle } from "@/utils/subscriptionUtils";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight text-gray-900">
            {subscription ? getSubscriptionTitle(subscription.subscription_tier) : 'Dashboard'}
          </h1>
          <p className="text-lg text-gray-500">
            Track your progress and manage your assessments
          </p>
        </header>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <SubscriptionCard subscription={subscription} error={error} />
            {previousAssessments.length > 0 && (
              <RecentAssessmentsCard assessments={previousAssessments} />
            )}
          </div>
          
          <div className="space-y-8">
            <QuickActionsCard subscription={subscription} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;