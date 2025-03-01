
import { useParams } from "react-router-dom";
import { DetailedReport } from "@/components/results/DetailedReport";
import { AssessmentLoading } from "@/components/assessment/AssessmentLoading";
import { AssessmentNotFound } from "@/components/assessment/AssessmentNotFound";
import { useAssessmentResult } from "@/hooks/useAssessmentResult";

const Assessment = () => {
  const { id } = useParams();
  const { result, loading, verifying, verificationAttempts, refreshPage } = useAssessmentResult(id);

  if (loading || verifying) {
    return (
      <AssessmentLoading
        verifying={verifying}
        verificationAttempts={verificationAttempts}
        onRefresh={refreshPage}
      />
    );
  }

  if (!result) {
    return <AssessmentNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <DetailedReport
        personalityType={result.personality_type}
        analysis={result.detailed_analysis}
        scores={result.category_scores || {}}
      />
    </div>
  );
};

export { Assessment };
