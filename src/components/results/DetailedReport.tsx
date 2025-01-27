import { motion } from "framer-motion";
import { Share2, ChartBar, FileText, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getLevelDescription } from "@/components/assessment/utils";

interface DetailedReportProps {
  personalityType: string;
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedReport = ({ personalityType, analysis, scores }: DetailedReportProps) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Moral Level Assessment",
          text: `I've discovered I'm at Level ${personalityType} in my moral development journey. Check out your own level!`,
          url: window.location.href
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `I've discovered I'm at Level ${personalityType} in my moral development journey. Check out your own level at ${window.location.href}`
        );
        toast({
          title: "Link copied!",
          description: "Share the link with your friends.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getGrowthRecommendations = (level: string) => {
    const nextLevelNum = parseInt(level) + 1;
    if (nextLevelNum > 9) return [];

    const recommendations = {
      "1": [
        "Practice long-term planning and goal setting",
        "Build trust through small collaborative exercises",
        "Focus on emotional regulation and stability",
        "Develop resource management skills"
      ],
      "2": [
        "Look for win-win opportunities in interactions",
        "Practice active listening and empathy",
        "Contribute to community projects",
        "Reflect on how actions affect others"
      ],
      "3": [
        "Stand up for fairness even when it doesn't benefit you",
        "Develop deeper understanding of justice",
        "Practice accountability in all areas",
        "Balance rights with responsibilities"
      ],
      "4": [
        "Cultivate deeper emotional awareness",
        "Practice perspective-taking regularly",
        "Develop compassionate responses",
        "Balance justice with mercy"
      ],
      "5": [
        "Look for opportunities to serve others",
        "Practice intentional sacrifice",
        "Expand your circle of concern",
        "Balance empathy with boundaries"
      ],
      "6": [
        "Align actions with core principles",
        "Develop moral consistency",
        "Practice integrity under pressure",
        "Lead by example"
      ],
      "7": [
        "Pursue excellence in character",
        "Inspire others through actions",
        "Balance wisdom and compassion",
        "Cultivate deeper self-awareness"
      ],
      "8": [
        "Align with universal truths",
        "Focus on eternal principles",
        "Develop transcendent perspective",
        "Create lasting positive impact"
      ]
    };
    return recommendations[level as keyof typeof recommendations] || [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6 p-4"
    >
      <Card className="overflow-hidden border-none shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-8">
          <CardTitle className="text-4xl font-bold text-center space-y-2">
            <span className="block text-gray-600">Your Moral Level</span>
            <span className="block text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Level {personalityType}
            </span>
          </CardTitle>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            {getLevelDescription(personalityType)}
          </p>
          <Button
            onClick={handleShare}
            className="mx-auto mt-4 bg-primary/10 text-primary hover:bg-primary/20"
            variant="ghost"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
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

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Growth Recommendations
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {getGrowthRecommendations(personalityType).map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-gray-600">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};