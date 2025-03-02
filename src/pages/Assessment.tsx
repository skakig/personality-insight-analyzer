
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
    purchaseStatus,
    allowAccess
  } = useAssessmentResult({ id });
  
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  
  useEffect(() => {
    if (result && purchaseStatus === 'complete') {
      setShowVerificationSuccess(true);
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [result, purchaseStatus]);

  const refreshPage = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <AssessmentLoading
        verifying={purchaseStatus === 'pending'}
        verificationAttempts={0}
        onRefresh={refreshPage}
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
            verificationAttempts={0}
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
