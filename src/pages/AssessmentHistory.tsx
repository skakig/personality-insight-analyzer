import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, ChartBar, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

interface QuizResult {
  id: string;
  user_id: string;
  personality_type: string;
  answers: Json;
  created_at: string;
  is_detailed: boolean;
  detailed_analysis: string | null;
  category_scores: Record<string, number> | null;
}

const AssessmentHistory = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        // First, check if user has quiz progress
        const { data: progressData, error: progressError } = await supabase
          .from('quiz_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError;
        }

        // If no progress exists, create it
        if (!progressData) {
          const { error: insertError } = await supabase
            .from('quiz_progress')
            .insert({
              user_id: user.id,
              current_level: 1,
              completed_levels: [1]
            });

          if (insertError) throw insertError;
        }

        // Fetch quiz results
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cast the category_scores to the correct type
        const typedResults = data?.map(result => ({
          ...result,
          category_scores: result.category_scores as Record<string, number> | null
        })) || [];

        setResults(typedResults);
      } catch (error: any) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  const handlePurchaseReport = async (resultId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLevelDescription = (level: string) => {
    const descriptions: { [key: string]: string } = {
      "1": "Self-Preservation: Focused on meeting basic needs and survival instincts. This level is characterized by reactive decision-making and strong self-preservation tendencies.",
      "2": "Self-Interest: Pragmatic approach with understanding of societal rules. Your moral framework centers on personal success while following beneficial social norms.",
      "3": "Social Contract: Your morality is based on cooperation and mutual benefit. You understand the importance of fairness and shared responsibilities.",
      "4": "Justice: Strong focus on fairness and accountability. You prioritize equity and balance rights with responsibilities in your moral decisions.",
      "5": "Empathy: Deep understanding of others' perspectives. Your morality is guided by emotional awareness and compassion.",
      "6": "Altruism: Selfless actions for the greater good. You often prioritize others' well-being over personal comfort.",
      "7": "Integrity: Consistent adherence to principles. Your actions align naturally with your core values and beliefs.",
      "8": "Virtue: Natural embodiment of moral excellence. You aspire to higher standards and inspire others through example.",
      "9": "Self-Actualization: Perfect alignment with universal truths. Your actions naturally serve the greater good and eternal principles.",
    };
    return descriptions[level] || "Understanding your moral development journey.";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Assessment History
          </h1>
          <p className="text-gray-600 mt-2">Your journey of moral development</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="hover:scale-105 transition-transform">
          Back to Dashboard
        </Button>
      </motion.div>

      {results.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <ChartBar className="h-16 w-16 text-primary mb-4" />
            <p className="text-xl text-gray-600 mb-6">No assessments taken yet.</p>
            <Button 
              onClick={() => navigate("/dashboard/quiz")}
              className="hover:scale-105 transition-transform"
            >
              Take Your First Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {results.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold">
                      Level {result.personality_type}
                    </CardTitle>
                    {!result.is_detailed && (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <CardDescription>
                    {new Date(result.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
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
                            Detailed personality analysis
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Category-specific insights
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            Personalized growth recommendations
                          </li>
                        </ul>
                        <Button 
                          onClick={() => handlePurchaseReport(result.id)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;