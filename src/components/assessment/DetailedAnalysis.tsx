import { FileText, ChartBar } from "lucide-react";

interface DetailedAnalysisProps {
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedAnalysis = ({ analysis, scores }: DetailedAnalysisProps) => {
  return (
    <div className="space-y-4">
      {analysis && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            Detailed Analysis
          </h4>
          <p className="text-gray-600">{analysis}</p>
        </div>
      )}
      {scores && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <ChartBar className="h-4 w-4 text-primary" />
            Category Scores
          </h4>
          {Object.entries(scores).map(([category, score]) => (
            <div key={category} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
              <span className="text-gray-600">{category}</span>
              <span className="font-medium">{score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};