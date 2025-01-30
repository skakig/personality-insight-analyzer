import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";
import { calculatePersonalityType } from "@/utils/personalityCalculator";

interface QuizQuestion {
  id: string;
  question: string;
  level: number;
  category: string;
  weight?: number;
  subcategory?: string;
  explanation?: string;
}

interface QuizProgress {
  user_id: string;
  current_level: number;
  completed_levels: number[];
}

export const useQuiz = (session: Session | null) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from Supabase
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching questions:', fetchError);
        throw new Error(fetchError.message);
      }

      if (!data || data.length === 0) {
        throw new Error('No questions available');
      }

      setQuestions(data);
    } catch (err: any) {
      console.error('Error in fetchQuestions:', err);
      setError(err.message || 'Failed to load quiz questions');
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save quiz results to Supabase
  const saveQuizResults = async (personalityType: string, userId: string) => {
    const { error: insertError } = await supabase
      .from('quiz_results')
      .insert({
        personality_type: personalityType,
        answers,
        user_id: userId
      });

    if (insertError) throw insertError;
  };

  // Get or create quiz progress
  const handleQuizProgress = async (userId: string) => {
    const { data: progressData, error: progressError } = await supabase
      .from('quiz_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }

    if (!progressData) {
      const { error: insertProgressError } = await supabase
        .from('quiz_progress')
        .insert({
          user_id: userId,
          current_level: 1,
          completed_levels: [1]
        });

      if (insertProgressError) throw insertProgressError;
    }
  };

  // Handle answer submission
  const handleAnswer = async (questionId: string, value: number) => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit answers.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const personalityType = calculatePersonalityType(newAnswers);
        await saveQuizResults(personalityType, session.user.id);
        await handleQuizProgress(session.user.id);

        toast({
          title: "Success",
          description: "Quiz completed successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error handling answer:', error);
      toast({
        title: "Error",
        description: "Failed to save your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    loading,
    error,
    handleAnswer,
    progress: (currentQuestionIndex / questions.length) * 100
  };
};