import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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

interface SupabaseQuizResult {
  id: string;
  user_id: string;
  personality_type: string;
  answers: Json;
  created_at: string;
  category_scores: Json;
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

        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match our QuizResult type
        const typedResults: QuizResult[] = (data as SupabaseQuizResult[] || []).map(result => ({
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Assessment History
            </span>
          </h1>
          <p className="text-lg text-gray-600">Your journey of moral development</p>
        </div>
        <Button 
          onClick={() => navigate("/dashboard")} 
          variant="outline" 
          className="hover:scale-105 transition-transform"
        >
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