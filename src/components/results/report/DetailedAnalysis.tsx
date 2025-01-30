import { FileText, ChartBar } from "lucide-react";

interface DetailedAnalysisProps {
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedAnalysis = ({ analysis, scores }: DetailedAnalysisProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Detailed Analysis
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {analysis}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-primary" />
          Category Scores
        </h3>
        <div className="space-y-3">
          {Object.entries(scores).map(([category, score]) => (
            <div key={category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{category}</span>
                <span className="font-medium">{score}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};