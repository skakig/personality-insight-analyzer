import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getLevelDescription } from "./utils";
import { AssessmentCardHeader } from "./CardHeader";
import { DetailedAnalysis } from "./DetailedAnalysis";
import { PurchaseSection } from "./PurchaseSection";
import { ArrowUpRight } from "lucide-react";

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
  const getHighlightText = (level: string) => {
    const highlights = {
      "1": "You're focused on building stability and security in your life.",
      "2": "You understand how to navigate and succeed in social situations.",
      "3": "You value fairness and cooperation in your relationships.",
      "4": "You have a strong sense of justice and accountability.",
      "5": "Your emotional intelligence sets you apart from others.",
      "6": "Your selfless nature makes a real difference in people's lives.",
      "7": "Your unwavering principles inspire those around you.",
      "8": "You embody excellence and inspire positive change.",
      "9": "Your actions align naturally with universal truths.",
    };
    return highlights[level as keyof typeof highlights] || "Your journey of moral growth continues.";
  };

  const getGrowthPotential = (level: string) => {
    // Convert the level to a number and add 1
    const nextLevelNum = parseInt(level) + 1;
    // Convert back to string for type safety
    const nextLevel = nextLevelNum.toString() as "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    
    // If next level is beyond 9, return null
    if (nextLevelNum > 9) return null;
    
    const potential = {
      "2": "Discover how to build meaningful connections while maintaining success",
      "3": "Learn to balance personal goals with collective harmony",
      "4": "Develop deeper empathy while upholding justice",
      "5": "Transform emotional understanding into purposeful action",
      "6": "Align your selfless actions with enduring principles",
      "7": "Elevate your principles to inspire lasting change",
      "8": "Connect your excellence with universal wisdom",
      "9": "Achieve perfect alignment with eternal truths",
    };
    return potential[nextLevel];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-100 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
        <AssessmentCardHeader 
          personalityType={result.personality_type}
          createdAt={result.created_at}
          isDetailed={result.is_detailed}
        />
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <p className="text-xl font-medium text-gray-900 leading-relaxed">
              {getHighlightText(result.personality_type)}
            </p>
            
            <div className="space-y-2">
              <p className="text-gray-600 leading-relaxed">
                {getLevelDescription(result.personality_type)}
              </p>
              
              {getGrowthPotential(result.personality_type) && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Your Growth Potential</p>
                      <p className="text-gray-600 mt-1">
                        {getGrowthPotential(result.personality_type)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
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