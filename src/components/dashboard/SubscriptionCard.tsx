import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionCardProps {
  subscription: {
    subscription_tier: string;
    max_assessments: number;
    assessments_used: number;
    active: boolean;
  } | null;
  error: string | null;
}

export const SubscriptionCard = ({ subscription, error }: SubscriptionCardProps) => {
  const navigate = useNavigate();

  const handlePurchaseCredits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          mode: 'payment',
          productType: 'credits'
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate credit purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            Purchase a subscription to access detailed analysis features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/pricing")}>View Plans</Button>
        </CardContent>
      </Card>
    );
  }

  const creditsRemaining = subscription.max_assessments - subscription.assessments_used;
  const usagePercentage = (subscription.assessments_used / subscription.max_assessments) * 100;
  const isLowOnCredits = usagePercentage >= 80;
  const isOutOfCredits = subscription.assessments_used >= subscription.max_assessments;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{subscription.subscription_tier} Plan</span>
          {subscription.active && (
            <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Active
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Track your assessment credit usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Credits Used: {subscription.assessments_used}</span>
            <span>Total Credits: {subscription.max_assessments}</span>
          </div>
          <Progress 
            value={usagePercentage} 
            className="h-2"
            variant={isLowOnCredits ? "warning" : undefined}
          />
          <p className="text-sm text-gray-500">
            {creditsRemaining} credits remaining
          </p>
        </div>

        {isOutOfCredits && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-800" />
            <AlertDescription>
              You've used all your assessment credits. Purchase more to continue accessing detailed reports.
            </AlertDescription>
          </Alert>
        )}
        
        {!isOutOfCredits && isLowOnCredits && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-800" />
            <AlertDescription>
              You're running low on assessment credits. Consider purchasing more to continue accessing detailed reports.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handlePurchaseCredits}
          className="w-full"
          variant="outline"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Purchase Additional Credits
        </Button>
      </CardContent>
    </Card>
  );
};