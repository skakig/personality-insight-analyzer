import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, AlertTriangle } from "lucide-react";

interface SubscriptionCardProps {
  subscription: {
    subscription_tier: string;
    assessments_used: number;
    max_assessments: number;
  } | null;
  error: string | null;
}

export const SubscriptionCard = ({ subscription, error }: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const usagePercentage = subscription 
    ? (subscription.assessments_used / subscription.max_assessments) * 100 
    : 0;

  const handlePurchaseCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase additional credits.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          userId: session.user.id,
          mode: 'payment',
          productType: 'credits'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium">Assessment Credits</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Track your assessment credit usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : subscription ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {subscription.assessments_used} credits used
                </span>
                <span className="text-sm font-medium">
                  {subscription.max_assessments} total credits
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {subscription.max_assessments - subscription.assessments_used} credits remaining
              </p>
            </div>
            
            <div className="space-y-4">
              {usagePercentage > 80 && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex gap-2 items-center text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      You're running low on assessment credits
                    </p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handlePurchaseCredits}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90"
              >
                <CreditCard className="h-4 w-4" />
                Purchase Additional Credits
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">No active subscription found.</p>
            <Button 
              onClick={() => navigate("/pricing")}
              className="w-full"
              variant="default"
            >
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};