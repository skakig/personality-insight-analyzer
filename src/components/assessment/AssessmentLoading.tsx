import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationStatusIndicator } from "./VerificationStatusIndicator";

interface AssessmentLoadingProps {
  verifying: boolean;
  verificationAttempts: number;
  onRefresh: () => void;
}

// Update the AssessmentLoading component to include the verification status indicator
export const AssessmentLoading = ({ 
  verifying, 
  verificationAttempts, 
  onRefresh 
}: AssessmentLoadingProps) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <VerificationStatusIndicator
            verifying={verifying}
            verificationAttempts={verificationAttempts}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-3">
            {verifying ? "Verifying Your Purchase" : "Loading Your Report"}
          </h2>
          <p className="text-gray-600 mb-6">
            {verifying
              ? "We're confirming your purchase. This may take a moment..."
              : "Your assessment is being prepared. Please wait..."}
          </p>
          
          {verificationAttempts > 2 && (
            <div className="mt-6">
              <Button onClick={onRefresh} variant="outline" className="mx-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
