import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "./report/ReportHeader";
import { DetailedAnalysis } from "./report/DetailedAnalysis";

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
      } catch (error: any) {
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
        <CardContent className="p-6">
          <ReportHeader personalityType={personalityType} />
          <DetailedAnalysis 
            analysis={analysis} 
            scores={scores} 
            personalityType={personalityType}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};