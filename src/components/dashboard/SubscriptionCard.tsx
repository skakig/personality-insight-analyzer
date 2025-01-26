import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium">Assessment Usage</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Track your assessment usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : subscription ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{subscription.assessments_used} used</span>
                <span>{subscription.max_assessments} total</span>
              </div>
              <Progress value={usagePercentage} className="h-1.5" />
              <p className="text-sm text-gray-600">
                {subscription.max_assessments - subscription.assessments_used} assessments remaining
              </p>
            </div>
            
            {usagePercentage > 80 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800 font-medium">
                  You're approaching your assessment limit
                </p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  className="mt-3 w-full bg-amber-100 text-amber-900 hover:bg-amber-200"
                  variant="ghost"
                >
                  Upgrade Plan
                </Button>
              </div>
            )}
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