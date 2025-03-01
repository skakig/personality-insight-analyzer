
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssessmentLoadingProps {
  verifying: boolean;
  verificationAttempts: number;
  onRefresh: () => void;
}

export const AssessmentLoading = ({ 
  verifying, 
  verificationAttempts, 
  onRefresh 
}: AssessmentLoadingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {verifying && (
          <p className="text-sm text-gray-600">
            {verificationAttempts === 0 
              ? "Verifying your purchase..." 
              : "Still processing your purchase..."}
          </p>
        )}
        {verificationAttempts > 0 && (
          <Button 
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Refresh Page
          </Button>
        )}
      </div>
    </div>
  );
};
