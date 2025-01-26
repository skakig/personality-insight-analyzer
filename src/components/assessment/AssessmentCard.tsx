import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getLevelDescription } from "./utils";
import { AssessmentCardHeader } from "./CardHeader";
import { DetailedAnalysis } from "./DetailedAnalysis";
import { PurchaseSection } from "./PurchaseSection";

interface AssessmentCardProps {
  result: {
    id: string;
    personality_type: string;
    created_at: string;
    detailed_analysis: string | null;
    is_detailed: boolean;
    category_scores: Record<string, number> | null;
  };
}

export const AssessmentCard = ({ result }: AssessmentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <AssessmentCardHeader 
          personalityType={result.personality_type}
          createdAt={result.created_at}
          isDetailed={result.is_detailed}
        />
        <CardContent className="space-y-6 p-6">
          <p className="text-gray-600 leading-relaxed">
            {getLevelDescription(result.personality_type)}
          </p>
          
          {result.is_detailed ? (
            <DetailedAnalysis 
              analysis={result.detailed_analysis || ''} 
              scores={result.category_scores || {}} 
            />
          ) : (
            <PurchaseSection resultId={result.id} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};