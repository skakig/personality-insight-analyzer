import { motion } from "framer-motion";
import { CalendarDays, ChartBar, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLevelDescription } from "./utils";
import { toast } from "@/components/ui/use-toast";

interface AssessmentCardProps {
  result: {
    id: string;
    personality_type: string;
    created_at: string;
    detailed_analysis: string | null;
    is_detailed: boolean;
    category_scores: Record<string, number> | null;
  };
  onPurchaseReport: (resultId: string) => Promise<void>;
}

export const AssessmentCard = ({ result, onPurchaseReport }: AssessmentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary/80">The Moral Hierarchy Results</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Level {result.personality_type}
                </h3>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 mr-1" />
                {new Date(result.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            {result.is_detailed ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <p className="text-gray-600 leading-relaxed">
            {getLevelDescription(result.personality_type)}
          </p>
          
          {result.is_detailed ? (
            <div className="space-y-4">
              {result.detailed_analysis && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Detailed Analysis
                  </h4>
                  <p className="text-gray-600">{result.detailed_analysis}</p>
                </div>
              )}
              {result.category_scores && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <ChartBar className="h-4 w-4 text-primary" />
                    Category Scores
                  </h4>
                  {Object.entries(result.category_scores).map(([category, score]) => (
                    <div key={category} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">{category}</span>
                      <span className="font-medium">{score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <h4 className="font-medium text-lg mb-2">Unlock Your Full Report</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Comprehensive personality analysis
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Detailed category breakdowns
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Personalized growth recommendations
                  </li>
                </ul>
                <Button 
                  onClick={() => onPurchaseReport(result.id)}
                  className="w-full mt-4 group"
                >
                  Purchase Full Report
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};