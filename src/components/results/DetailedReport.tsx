
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { WeaknessesAndStrategies } from "./report/WeaknessesAndStrategies";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface DetailedReportProps {
  personalityType: string;
  analysis: string;
  scores: Record<string, number>;
  resultId?: string;
}

export const DetailedReport = ({ personalityType, analysis, resultId }: DetailedReportProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const sendDetailedReport = async () => {
      if (!userEmail) {
        // Check if there's a guest email in localStorage
        const guestEmail = localStorage.getItem('guestEmail');
        if (guestEmail) {
          sendReportEmail(guestEmail);
        }
        return;
      }

      sendReportEmail(userEmail);
    };

    if (!emailSent && personalityType && analysis) {
      sendDetailedReport();
    }
  }, [personalityType, analysis, userEmail, emailSent]);

  const sendReportEmail = async (email: string) => {
    try {
      console.log('Sending detailed report to:', email);
      
      const { error } = await supabase.functions.invoke('send-detailed-report', {
        body: {
          email,
          personalityType,
          analysis
        }
      });

      if (error) throw error;

      setEmailSent(true);
      
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

  const handleSaveReport = async () => {
    if (isAuthenticated) {
      toast({
        title: "Already Saved",
        description: "This report is already saved to your account.",
      });
      return;
    }

    if (!resultId) {
      toast({
        title: "Error",
        description: "No result ID available to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a URL to redirect back to after authentication
      const returnUrl = `/assessment/${resultId}`;
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      
      // Redirect to auth page with returnTo parameter
      navigate(`/auth?returnTo=${encodedReturnUrl}`);
      
    } catch (error) {
      console.error('Error preparing for report save:', error);
      toast({
        title: "Error",
        description: "Failed to prepare report saving. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
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
          
          {/* Save Report Button - only show for guests */}
          {isAuthenticated === false && resultId && (
            <div className="my-6 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleSaveReport}
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save This Report To Your Account'
                )}
              </Button>
            </div>
          )}
          
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

            {/* Weaknesses and Strategies */}
            <WeaknessesAndStrategies level={personalityType} />

            {/* Detailed Analysis */}
            <DetailedAnalysisSection personalityType={personalityType} />

            {/* Growth Recommendations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Recommendations</h2>
              <GrowthRecommendations personalityType={personalityType} />
            </section>

            {/* Final Reflection */}
            <FinalReflection email={userEmail || localStorage.getItem('guestEmail')} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
