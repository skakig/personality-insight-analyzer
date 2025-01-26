import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { AssessmentCard } from "@/components/assessment/AssessmentCard";
import { EmptyState } from "@/components/assessment/EmptyState";
import { Json } from "@/integrations/supabase/types";

interface QuizResult {
  id: string;
  user_id: string;
  personality_type: string;
  answers: Json;
  created_at: string;
  category_scores: Record<string, number> | null;
  detailed_analysis: string | null;
  is_detailed: boolean;
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

        // Check for quiz progress
        const { data: progressData, error: progressError } = await supabase
          .from('quiz_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError;
        }

        // Create progress if it doesn't exist
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

        // Cast the data to ensure it matches the QuizResult type
        const typedResults = (data || []).map(result => ({
          ...result,
          category_scores: result.category_scores as Record<string, number> | null
        }));

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
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {results.map((result) => (
            <AssessmentCard
              key={result.id}
              result={result}
              onPurchaseReport={handlePurchaseReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;