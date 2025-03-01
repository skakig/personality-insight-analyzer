
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationStatusIndicatorProps {
  verifying: boolean;
  verificationAttempts: number;
  isSuccess?: boolean;
  onRefresh?: () => void;
}

export const VerificationStatusIndicator = ({
  verifying,
  verificationAttempts,
  isSuccess = false,
  onRefresh
}: VerificationStatusIndicatorProps) => {
  if (isSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700">Purchase verified!</AlertTitle>
        <AlertDescription className="text-green-600">
          Your report is now ready to view.
        </AlertDescription>
      </Alert>
    );
  }

  if (!verifying) {
    return null;
  }

  if (verificationAttempts <= 1) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Clock className="h-5 w-5 text-blue-500" />
        <div className="flex items-center gap-2">
          <AlertTitle className="text-blue-700">Verifying your purchase</AlertTitle>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        </div>
        <AlertDescription className="text-blue-600">
          Please wait while we prepare your report...
        </AlertDescription>
      </Alert>
    );
  }

  if (verificationAttempts > 3) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-amber-700">Verification taking longer than expected</AlertTitle>
        <div className="flex flex-col space-y-2">
          <AlertDescription className="text-amber-600">
            We're still working on verifying your purchase. This may take a moment...
          </AlertDescription>
          {onRefresh && (
            <div className="mt-2">
              <Button onClick={onRefresh} variant="outline" size="sm" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-700">Verification in progress</AlertTitle>
      <AlertDescription className="text-amber-600">
        Your purchase is being verified. This may take a moment...
      </AlertDescription>
    </Alert>
  );
};
