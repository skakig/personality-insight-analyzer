import { motion } from "framer-motion";
import { Share2, ChartBar, FileText, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getLevelDescription } from "@/components/assessment/utils";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getGrowthRecommendations = (level: string): string[] => {
  const recommendations: Record<string, string[]> = {
    "1": [
      "Practice making decisions that balance immediate needs with long-term stability",
      "Build trust gradually through small collaborative experiences",
      "Focus on developing emotional regulation skills",
      "Create a support network for personal growth"
    ],
    "2": [
      "Look for opportunities to help others while pursuing personal goals",
      "Practice active listening and empathy in relationships",
      "Develop skills that benefit both yourself and others",
      "Learn to balance competition with cooperation"
    ],
    "3": [
      "Strengthen your commitment to fairness in all interactions",
      "Take on responsibilities that serve the community",
      "Practice resolving conflicts through mutual understanding",
      "Build deeper, more meaningful relationships"
    ],
    "4": [
      "Develop your capacity for empathy while maintaining principles",
      "Learn to balance justice with mercy in your decisions",
      "Practice standing up for others, not just rules",
      "Seek to understand the root causes of unfairness"
    ],
    "5": [
      "Channel your emotional understanding into meaningful action",
      "Practice setting healthy boundaries while helping others",
      "Develop wisdom to guide your empathetic responses",
      "Learn to inspire positive change through understanding"
    ],
    "6": [
      "Ensure your sacrifices create lasting positive impact",
      "Balance selflessness with personal well-being",
      "Develop discernment in choosing when to give",
      "Inspire others through purposeful service"
    ],
    "7": [
      "Align your principles with universal truths",
      "Practice flexibility while maintaining integrity",
      "Lead by example without seeking recognition",
      "Help others develop their own moral compass"
    ],
    "8": [
      "Seek opportunities to mentor and guide others",
      "Balance excellence with humility",
      "Create systems that promote virtue in others",
      "Maintain growth mindset despite achievements"
    ],
    "9": [
      "Share your wisdom while remaining teachable",
      "Help others connect with universal truths",
      "Create lasting positive change in the world",
      "Maintain humility while inspiring excellence"
    ]
  };
  return recommendations[level] || [
    "Focus on personal growth and development",
    "Seek to understand your values and principles",
    "Practice mindfulness in your decisions",
    "Build meaningful connections with others"
  ];
};

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

  useEffect(() => {
    const sendDetailedReport = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-detailed-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            personalityType,
            analysis,
            scores
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        toast({
          title: "Report Sent!",
          description: "Check your email for your detailed report.",
        });
      } catch (error) {
        console.error('Error sending report:', error);
        toast({
          title: "Error",
          description: "Failed to send report to email. Please try again later.",
          variant: "destructive",
        });
      }
    };

    sendDetailedReport();
  }, [personalityType, analysis, scores]);

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