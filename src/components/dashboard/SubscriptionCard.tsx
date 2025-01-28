import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SubscriptionCardProps } from "@/types/dashboard";
import { SubscriptionHeader } from "./subscription/SubscriptionHeader";
import { SubscriptionProgress } from "./subscription/SubscriptionProgress";
import { SubscriptionAlert } from "./subscription/SubscriptionAlert";
import { PurchaseCreditsButton } from "./subscription/PurchaseCreditsButton";
import { NoSubscriptionCard } from "./subscription/NoSubscriptionCard";

export const SubscriptionCard = ({ subscription, error }: SubscriptionCardProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return <NoSubscriptionCard />;
  }

  const creditsRemaining = subscription.max_assessments - subscription.assessments_used;
  const usagePercentage = (subscription.assessments_used / subscription.max_assessments) * 100;
  const isLowOnCredits = usagePercentage >= 80;
  const isOutOfCredits = subscription.assessments_used >= subscription.max_assessments;

  return (
    <Card>
      <SubscriptionHeader 
        subscriptionTier={subscription.subscription_tier}
        isActive={subscription.active}
      />
      <CardContent className="space-y-6">
        <SubscriptionProgress 
          usagePercentage={usagePercentage}
          creditsRemaining={creditsRemaining}
          isLowOnCredits={isLowOnCredits}
        />

        <SubscriptionAlert 
          isOutOfCredits={isOutOfCredits}
          isLowOnCredits={isLowOnCredits}
        />
        
        <PurchaseCreditsButton />
      </CardContent>
    </Card>
  );
};