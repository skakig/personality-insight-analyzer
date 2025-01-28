import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "./report/ReportHeader";
import { DetailedAnalysis } from "./report/DetailedAnalysis";
import { GrowthRecommendations } from "./report/GrowthRecommendations";

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
        <CardContent className="p-0">
          <ReportHeader personalityType={personalityType} />
          <div className="space-y-8 p-8">
            <DetailedAnalysis analysis={analysis} scores={scores} />
            <GrowthRecommendations personalityType={personalityType} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};