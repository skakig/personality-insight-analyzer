import { FileText, ChartBar, AlertCircle, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      {/* Personal Analysis Section */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Personal Analysis</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">{analysis}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Scores Section */}
      <Card className="overflow-hidden border-none shadow-sm">
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

          <div className="space-y-6">
            {Object.entries(scores).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {score.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {getScoreInterpretation(score)}
                    </span>
                  </div>
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

          <div className="mt-8 flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
            <AlertCircle className="h-5 w-5 text-primary mt-1" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">Understanding Your Scores</p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>4.5-5.0: Exceptional - Mastery level understanding</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>4.0-4.4: Strong - Consistent application</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>3.0-3.9: Developing - Good foundation</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>2.0-2.9: Emerging - Beginning to understand</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>1.0-1.9: Needs Focus - Opportunity for growth</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Growth Path Section */}
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ArrowUpRight className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Your Growth Path</h3>
              <p className="text-gray-600 mt-2">
                Based on your scores, here are key areas for development:
              </p>
              <div className="mt-4 space-y-3">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => a - b)
                  .slice(0, 3)
                  .map(([category, score]) => (
                    <div key={category} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium text-gray-900">{category}</p>
                        <p className="text-sm text-gray-600">
                          Focus on improving your {category.toLowerCase()} score ({score.toFixed(1)}) 
                          through consistent practice and reflection.
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};