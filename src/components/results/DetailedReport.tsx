import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "./report/ReportHeader";
import { DetailedAnalysis } from "./report/DetailedAnalysis";
import { GrowthRecommendations } from "./report/GrowthRecommendations";
import { getLevelDescription } from "@/components/assessment/utils";
import { HighlightSection } from "@/components/assessment/HighlightSection";
import { GrowthPotential } from "@/components/assessment/GrowthPotential";
import { Sparkles, Star, Heart, Scale, Lightbulb } from "lucide-react";

interface DetailedReportProps {
  personalityType: string;
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedReport = ({ personalityType, analysis, scores }: DetailedReportProps) => {
  useEffect(() => {
    const sendDetailedReport = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const { error } = await supabase.functions.invoke('send-detailed-report', {
          body: {
            email: user.email,
            personalityType,
            analysis,
            scores
          }
        });

        if (error) throw error;

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

  const getSuccessMarkers = (level: string) => {
    const markers = {
      "9": [
        {
          title: "Complete Unity of Thought and Purpose",
          description: "You exhibit natural alignment with moral principles, acting instinctively with wisdom and purpose.",
          icon: <Sparkles className="h-5 w-5 text-primary" />
        },
        {
          title: "Detachment from Ego",
          description: "You demonstrate freedom from material attachments and operate from a place of pure service.",
          icon: <Star className="h-5 w-5 text-primary" />
        },
        {
          title: "Profound Mercy and Love",
          description: "You embody unconditional love and forgiveness, seeing beyond human failures.",
          icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
          title: "Divine Balance",
          description: "You understand the harmony between justice and mercy, truth and compassion.",
          icon: <Scale className="h-5 w-5 text-primary" />
        },
        {
          title: "Higher Purpose",
          description: "You live as an instrument of divine will, accepting both joy and suffering as part of your mission.",
          icon: <Lightbulb className="h-5 w-5 text-primary" />
        }
      ],
      // ... Add markers for other levels
    };
    return markers[level as keyof typeof markers] || [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 p-4"
    >
      <Card className="overflow-hidden border-none shadow-lg bg-white">
        <CardContent className="p-8">
          <ReportHeader personalityType={personalityType} />
          
          <div className="mt-8 space-y-8">
            {/* Level Overview */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Moral Development Level</h2>
              <div className="bg-primary/5 rounded-lg p-6">
                <HighlightSection level={personalityType} />
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {getLevelDescription(personalityType)}
                </p>
              </div>
            </section>

            {/* Success Markers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Key Success Markers</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {getSuccessMarkers(personalityType).map((marker, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      {marker.icon}
                      <div>
                        <h3 className="font-medium text-gray-900">{marker.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Growth Path */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Path</h2>
              <GrowthPotential level={personalityType} />
            </section>

            {/* Detailed Analysis with Scores */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Detailed Analysis</h2>
              <DetailedAnalysis analysis={analysis} scores={scores} />
            </section>

            {/* Growth Recommendations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Recommendations</h2>
              <GrowthRecommendations personalityType={personalityType} />
            </section>

            {/* Final Reflection */}
            <section className="bg-secondary/5 rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Final Reflection</h2>
              <p className="text-gray-600">
                Your journey in moral development is unique and valuable. Each step you take toward higher understanding
                and awareness contributes to both your personal growth and the betterment of those around you. Continue
                to embrace this path of growth while maintaining balance and compassion for yourself and others.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  A copy of this report has been sent to your email for future reference.
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};