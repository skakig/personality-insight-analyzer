
import { useParams } from "react-router-dom";
import { DetailedReport } from "@/components/results/DetailedReport";
import { AssessmentLoading } from "@/components/assessment/AssessmentLoading";
import { AssessmentNotFound } from "@/components/assessment/AssessmentNotFound";
import { useAssessmentResult } from "@/hooks/useAssessmentResult";
import { VerificationStatusIndicator } from "@/components/assessment/VerificationStatusIndicator";
import { useState, useEffect } from "react";
import { UseAssessmentResultProps } from "@/types/quiz";

const Assessment = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    result,
    loading,
    error,
    isVerifying,
    verificationComplete,
    verificationSuccess,
    verificationAttempts,
    refreshPage,
    runVerification
  } = useAssessmentResult(id ? { id } : {});
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  
  useEffect(() => {
    if (result && (verificationSuccess || (isVerifying === false && verificationAttempts > 0))) {
      setShowVerificationSuccess(true);
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [result, isVerifying, verificationAttempts, verificationSuccess]);

  if (loading || isVerifying) {
    return (
      <AssessmentLoading
        verifying={isVerifying}
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
