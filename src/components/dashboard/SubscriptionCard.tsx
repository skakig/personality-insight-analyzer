
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SubscriptionCardProps } from "@/types/dashboard";
import { SubscriptionHeader } from "./subscription/SubscriptionHeader";
import { SubscriptionProgress } from "./subscription/SubscriptionProgress";
import { SubscriptionAlert } from "./subscription/SubscriptionAlert";
import { PurchaseCreditsButton } from "./subscription/PurchaseCreditsButton";
import { NoSubscriptionCard } from "./subscription/NoSubscriptionCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const SubscriptionCard = ({ subscription, error }: SubscriptionCardProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Handle guest user who needs to set up account
  const isGuestUser = !supabase.auth.getSession() && subscription;
  if (isGuestUser) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Secure Your Account</h3>
          <p className="text-gray-600">
            Thank you for your purchase! To access all features and secure your account, 
            please set up a password.
          </p>
          <Button 
            className="w-full"
            onClick={() => {
              // Redirect to auth page with email pre-filled
              window.location.href = "/auth?setup=true";
            }}
          >
            Set Up Password
          </Button>
        </CardContent>
      </Card>
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
