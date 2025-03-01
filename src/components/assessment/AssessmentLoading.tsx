
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 max-w-md w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        
        {verifying && verificationAttempts === 0 && (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              Verifying your purchase...
            </p>
            <p className="text-sm text-gray-600">
              Please wait while we prepare your detailed report.
            </p>
          </div>
        )}
        
        {verifying && verificationAttempts > 0 && verificationAttempts < 3 && (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              Still processing your purchase...
            </p>
            <p className="text-sm text-gray-600">
              This is taking a little longer than expected. Please wait a moment.
            </p>
          </div>
        )}
        
        {verifying && verificationAttempts >= 3 && (
          <>
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Delayed</AlertTitle>
              <AlertDescription>
                We're having trouble verifying your purchase. You can try refreshing the page or check your purchase history in your dashboard.
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-4 mt-4">
              <Button 
                onClick={onRefresh}
                variant="default"
                size="sm"
              >
                Refresh Page
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                size="sm"
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
