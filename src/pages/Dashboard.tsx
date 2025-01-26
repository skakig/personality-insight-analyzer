import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Subscription {
  subscription_tier: string;
  max_assessments: number;
  assessments_used: number;
  active: boolean;
}

const Dashboard = ({ session }: { session: any }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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
          .single();

        if (error) throw error;
        setSubscription(data);
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Corporate Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Tier: {subscription.subscription_tier}
                </p>
                <p>
                  Assessments: {subscription.assessments_used} / {subscription.max_assessments} used
                </p>
                <p>Status: {subscription.active ? "Active" : "Inactive"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">No active subscription found.</p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  className="w-full"
                >
                  View Plans
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
              onClick={() => navigate("/new-assessment")}
              disabled={!subscription?.active}
            >
              New Assessment
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
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Assessment insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;