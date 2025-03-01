
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface VerificationStatusIndicatorProps {
  verifying: boolean;
  verificationAttempts: number;
  isSuccess?: boolean;
}

export const VerificationStatusIndicator = ({
  verifying,
  verificationAttempts,
  isSuccess = false,
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

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-700">Verification in progress</AlertTitle>
      <AlertDescription className="text-amber-600">
        {verificationAttempts > 3
          ? "Taking longer than expected. You can refresh the page or check your dashboard."
          : "Your purchase is being verified. This may take a moment..."}
      </AlertDescription>
    </Alert>
  );
};
