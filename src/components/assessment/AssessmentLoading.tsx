
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
  const handleGoToDashboard = () => {
    // Store current verification state
    localStorage.setItem('lastVerificationAttempts', verificationAttempts.toString());
    window.location.href = '/dashboard';
  };
  
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
              Please wait while we prepare your detailed report. This may take a few moments.
            </p>
          </div>
        )}
        
        {verifying && verificationAttempts > 0 && verificationAttempts < 3 && (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              Still processing your purchase...
            </p>
            <p className="text-sm text-gray-600">
              This is taking a little longer than expected. We're verifying your payment with Stripe.
            </p>
            <Button 
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Refresh Page
            </Button>
          </div>
        )}
        
        {verifying && verificationAttempts >= 3 && (
          <>
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Delayed</AlertTitle>
              <AlertDescription>
                We're having trouble verifying your purchase. Your report is likely ready, but verification is taking longer than expected.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col space-y-3 mt-4 w-full">
              <Button 
                onClick={onRefresh}
                variant="default"
                size="sm"
              >
                Refresh Page
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                variant="outline"
                size="sm"
              >
                Go to Dashboard
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Don't worry - your purchase has been processed, and your report is 
                available on your dashboard even if verification is delayed.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
