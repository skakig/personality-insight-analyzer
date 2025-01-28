import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SubscriptionAlertProps {
  isOutOfCredits: boolean;
  isLowOnCredits: boolean;
}

export const SubscriptionAlert = ({ isOutOfCredits, isLowOnCredits }: SubscriptionAlertProps) => {
  if (isOutOfCredits) {
    return (
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-800" />
        <AlertDescription>
          You've used all your assessment credits. Purchase more to continue accessing detailed reports.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLowOnCredits) {
    return (
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-800" />
        <AlertDescription>
          You're running low on assessment credits. Consider purchasing more to continue accessing detailed reports.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};