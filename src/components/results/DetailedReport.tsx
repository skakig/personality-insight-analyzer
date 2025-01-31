import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "./report/ReportHeader";
import { GrowthRecommendations } from "./report/GrowthRecommendations";
import { getLevelDescription } from "@/components/assessment/utils";
import { HighlightSection } from "@/components/assessment/HighlightSection";
import { GrowthPotential } from "@/components/assessment/GrowthPotential";
import { SuccessMarkers } from "./report/SuccessMarkers";
import { DetailedAnalysisSection } from "./report/DetailedAnalysisSection";
import { FinalReflection } from "./report/FinalReflection";

interface DetailedReportProps {
  personalityType: string;
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedReport = ({ personalityType, analysis }: DetailedReportProps) => {
  useEffect(() => {
    const sendDetailedReport = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const { error } = await supabase.functions.invoke('send-detailed-report', {
          body: {
            email: user.email,
            personalityType,
            analysis
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
  }, [personalityType, analysis]);

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
            <SuccessMarkers personalityType={personalityType} />

            {/* Growth Path */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Path</h2>
              <GrowthPotential level={personalityType} />
            </section>

            {/* Detailed Analysis */}
            <DetailedAnalysisSection personalityType={personalityType} />

            {/* Growth Recommendations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Recommendations</h2>
              <GrowthRecommendations personalityType={personalityType} />
            </section>

            {/* Final Reflection */}
            <FinalReflection />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};