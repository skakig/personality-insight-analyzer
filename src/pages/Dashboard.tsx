import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentCard } from "@/components/assessment/AssessmentCard";

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

  const handleTakeAssessment = () => {
    navigate("/dashboard/quiz");
  };

  const usagePercentage = subscription 
    ? (subscription.assessments_used / subscription.max_assessments) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        {subscription ? getSubscriptionTitle(subscription.subscription_tier) : 'Dashboard'}
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Assessment Usage</CardTitle>
            <CardDescription>Track your assessment usage and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{subscription.assessments_used} used</span>
                    <span>{subscription.max_assessments} total</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>
                <p className="text-sm text-gray-600">
                  {subscription.max_assessments - subscription.assessments_used} assessments remaining
                </p>
                {usagePercentage > 80 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      You're approaching your assessment limit.
                    </p>
                    <Button 
                      onClick={() => navigate("/pricing")}
                      className="mt-2"
                      variant="outline"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">No active subscription found.</p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  className="w-full group"
                >
                  View Plans
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full"
              onClick={handleTakeAssessment}
              disabled={!subscription?.active || (subscription?.assessments_used >= subscription?.max_assessments)}
            >
              Take Assessment
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/assessment-history")}
            >
              View History
            </Button>
          </CardContent>
        </Card>

        {previousAssessments.length > 0 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your latest assessment results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previousAssessments.slice(0, 3).map((result) => (
                <AssessmentCard key={result.id} result={result} />
              ))}
              {previousAssessments.length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/assessment-history")}
                >
                  View All Assessments
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const getSubscriptionTitle = (tier: string)toLowerCase()) {
    case 'individual':
      return 'Individual Dashboard';
    case 'pro':
      return 'Professional Dashboard';
    case 'enterprise':
      return 'Enterprise Dashboard';
    default:
      return 'Dashboard';
  }
};

export default Dashboard;