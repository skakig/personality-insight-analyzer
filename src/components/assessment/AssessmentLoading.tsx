
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VerificationStatusIndicator } from "./VerificationStatusIndicator";

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
        <VerificationStatusIndicator
          verifying={verifying}
          verificationAttempts={verificationAttempts}
        />
        
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        
        {!verifying && (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-1">
              Loading your assessment...
            </p>
            <p className="text-sm text-gray-600">
              Please wait while we prepare your report.
            </p>
          </div>
        )}
        
        {verifying && verificationAttempts >= 3 && (
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
        )}
      </div>
    </div>
  );
};
