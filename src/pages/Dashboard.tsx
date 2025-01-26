import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DashboardProps {
  session: any;
}

const getSubscriptionTitle = (tier: string) => {
  switch (tier?.toLowerCase()) {
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

const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('corporate_subscriptions')
          .select('*')
          .eq('organization_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          setError('Failed to load subscription data');
          toast({
            title: "Error",
            description: "Failed to load subscription data. Please try again.",
            variant: "destructive",
          });
        } else {
          setSubscription(data);
        }
      } catch (error: any) {
        console.error('Error:', error);
        setError('An unexpected error occurred');
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session, navigate]);

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const usagePercentage = subscription 
    ? (subscription.assessments_used / subscription.max_assessments) * 100 
    : 0;

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
                      You're approaching your assessment limit. Consider upgrading your plan to ensure uninterrupted access.
                    </p>
                    <Button 
                      onClick={handleUpgrade}
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
              onClick={() => navigate("/dashboard/quiz")}
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

        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Your current plan information</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-medium">{subscription.subscription_tier}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    {subscription.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  Upgrade Plan
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">No active subscription</p>
                <Button onClick={() => navigate("/pricing")}>
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;