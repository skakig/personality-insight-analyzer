
import { useParams } from "react-router-dom";
import { DetailedReport } from "@/components/results/DetailedReport";
import { AssessmentLoading } from "@/components/assessment/AssessmentLoading";
import { AssessmentNotFound } from "@/components/assessment/AssessmentNotFound";
import { useAssessmentResult } from "@/hooks/useAssessmentResult";
import { VerificationStatusIndicator } from "@/components/assessment/VerificationStatusIndicator";
import { useState, useEffect } from "react";

const Assessment = () => {
  const { id } = useParams();
  const { 
    result, 
    loading, 
    verifying, 
    verificationAttempts, 
    verificationSuccess,
    refreshPage 
  } = useAssessmentResult(id);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  
  // Show success indicator briefly when verification completes
  useEffect(() => {
    if (result && (verificationSuccess || (verifying === false && verificationAttempts > 0))) {
      setShowVerificationSuccess(true);
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [result, verifying, verificationAttempts, verificationSuccess]);

  if (loading || verifying) {
    return (
      <AssessmentLoading
        verifying={verifying}
        verificationAttempts={verificationAttempts}
        onRefresh={() => refreshPage()}
      />
    );
  }

  if (!result) {
    return <AssessmentNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {showVerificationSuccess && (
        <div className="container mx-auto px-4 mb-6">
          <VerificationStatusIndicator
            verifying={false}
            verificationAttempts={verificationAttempts}
            isSuccess={true}
          />
        </div>
      )}
      <DetailedReport
        personalityType={result.personality_type}
        analysis={result.detailed_analysis}
        scores={result.category_scores || {}}
      />
    </div>
  );
};

export { Assessment };
