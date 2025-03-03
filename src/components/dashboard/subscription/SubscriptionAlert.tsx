
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubscriptionProgress } from "./SubscriptionProgress";

export interface SubscriptionAlertProps {
  assessmentsUsed: number;
  maxAssessments: number;
  progress: number;
}

export const SubscriptionAlert = ({ 
  assessmentsUsed, 
  maxAssessments, 
  progress 
}: SubscriptionAlertProps) => {
  const isLowOnCredits = assessmentsUsed >= maxAssessments * 0.8;
  
  return (
    <Alert variant={isLowOnCredits ? "destructive" : "default"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isLowOnCredits ? "Running low on assessments" : "Assessment Credits"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm">
          {assessmentsUsed} of {maxAssessments} assessments used
        </div>
        <SubscriptionProgress progress={progress} />
      </AlertDescription>
    </Alert>
  );
};
