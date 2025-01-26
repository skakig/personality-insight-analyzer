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
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};