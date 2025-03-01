
import { CheckCircle, Clock, AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VerificationStatusIndicatorProps {
  verificationAttempts: number;
  verifying: boolean;
  isSuccess?: boolean;
}

export const VerificationStatusIndicator = ({
  verificationAttempts,
  verifying,
  isSuccess = false
}: VerificationStatusIndicatorProps) => {
  if (!verifying && !isSuccess) return null;

  // Success state
  if (isSuccess) {
    return (
      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-800" />
        <AlertTitle>Purchase Verified</AlertTitle>
        <AlertDescription>
          Your purchase has been successfully verified. Your detailed report is now available.
        </AlertDescription>
      </Alert>
    );
  }

  // Initial verification
  if (verificationAttempts === 0) {
    return (
      <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
        <Loader className="h-4 w-4 text-blue-800 animate-spin" />
        <AlertTitle>Verifying Purchase</AlertTitle>
        <AlertDescription>
          Please wait while we verify your purchase. This usually takes just a few seconds.
        </AlertDescription>
      </Alert>
    );
  }

  // Low attempts (1-2)
  if (verificationAttempts <= 2) {
    return (
      <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
        <Clock className="h-4 w-4 text-yellow-800" />
        <AlertTitle>Verification in Progress</AlertTitle>
        <AlertDescription>
          Your purchase verification is taking a bit longer than usual. 
          We're making attempt {verificationAttempts} to confirm your purchase.
        </AlertDescription>
      </Alert>
    );
  }

  // High attempts (3+)
  return (
    <Alert className="mb-4 bg-orange-50 text-orange-800 border-orange-200">
      <AlertCircle className="h-4 w-4 text-orange-800" />
      <AlertTitle>Verification Delayed</AlertTitle>
      <AlertDescription>
        We're having trouble verifying your purchase (attempt {verificationAttempts}).
        Don't worry - if you've completed checkout, your purchase has been processed
        and your report will be available shortly.
      </AlertDescription>
    </Alert>
  );
};
