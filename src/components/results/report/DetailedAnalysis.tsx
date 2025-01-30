import { FileText, ChartBar, AlertCircle } from "lucide-react";

interface DetailedAnalysisProps {
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedAnalysis = ({ analysis, scores }: DetailedAnalysisProps) => {
  const getScoreInterpretation = (score: number) => {
    if (score >= 4.5) return "Exceptional";
    if (score >= 4.0) return "Strong";
    if (score >= 3.0) return "Developing";
    if (score >= 2.0) return "Emerging";
    return "Needs Focus";
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "from-green-500 to-green-600";
    if (score >= 4.0) return "from-blue-500 to-blue-600";
    if (score >= 3.0) return "from-yellow-500 to-yellow-600";
    if (score >= 2.0) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Analysis Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-gray-900">Personal Analysis</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{analysis}</p>
          </div>
        </div>
      </div>

      {/* Scores Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-6">
          <ChartBar className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-gray-900">Category Scores</h3>
            <p className="text-gray-600 mt-1">
              Your performance across key moral development categories
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(scores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <span className="text-sm font-medium text-gray-900">
                  {score.toFixed(1)} - {getScoreInterpretation(score)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-500`}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
          <AlertCircle className="h-5 w-5 text-primary mt-1" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Understanding Your Scores</p>
            <p>
              Scores range from 1-5, where:
              <br />• 4.5-5.0: Exceptional - Mastery level understanding and application
              <br />• 4.0-4.4: Strong - Consistent application with room for refinement
              <br />• 3.0-3.9: Developing - Good foundation with areas for growth
              <br />• 2.0-2.9: Emerging - Beginning to understand and apply concepts
              <br />• 1.0-1.9: Needs Focus - Opportunity for significant growth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};