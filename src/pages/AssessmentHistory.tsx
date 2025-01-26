import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

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
      "1": "Self-Preservation: Focused on basic needs and survival instincts.",
      "2": "Self-Interest: Pragmatic approach with understanding of societal rules.",
      "3": "Social Contract: Cooperative morality based on mutual benefit.",
      "4": "Justice: Strong focus on fairness and accountability.",
      "5": "Empathy: Deep understanding of others' perspectives.",
      "6": "Altruism: Selfless actions for the greater good.",
      "7": "Integrity: Consistent adherence to principles.",
      "8": "Virtue: Natural embodiment of moral excellence.",
      "9": "Self-Actualization: Alignment with universal truths.",
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assessment History</h1>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-gray-600 mb-4">No assessments taken yet.</p>
            <Button onClick={() => navigate("/dashboard/quiz")}>Take Assessment</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <Card key={result.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Level {result.personality_type}
                  {!result.is_detailed && <Lock className="h-4 w-4 text-gray-400" />}
                </CardTitle>
                <CardDescription>
                  {new Date(result.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-4">
                  {getLevelDescription(result.personality_type)}
                </p>
                
                {result.is_detailed ? (
                  <>
                    {result.detailed_analysis && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Detailed Analysis</h4>
                        <p className="text-sm text-gray-600">{result.detailed_analysis}</p>
                      </div>
                    )}
                    {result.category_scores && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Category Scores</h4>
                        {Object.entries(result.category_scores).map(([category, score]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span>{category}:</span>
                            <span className="font-medium">{score}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-auto">
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Unlock Full Analysis</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Get detailed insights into your moral development, personalized recommendations, 
                        and a comprehensive breakdown of your results.
                      </p>
                      <Button 
                        onClick={() => handlePurchaseReport(result.id)}
                        className="w-full"
                      >
                        Purchase Full Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;