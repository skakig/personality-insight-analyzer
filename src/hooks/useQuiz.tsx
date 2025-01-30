import { useState, useEffect } from "react";
import { calculatePersonalityType } from "@/utils/personalityCalculator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface QuizQuestion {
  id: string;
  level: number;
  question: string;
  category: string;
  weight: number;
}

export const useQuiz = (session: any) => {
  const [currentStep, setCurrentStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchQuestions();
  }, []);

  const handleStart = () => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Quiz questions are not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("questions");
  };

  const handleAnswer = async (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("results");
      
      if (session?.user?.id) {
        try {
          const personalityType = calculatePersonalityType(newAnswers);
          
          const { error: insertError } = await supabase
            .from('quiz_results')
            .insert({
              personality_type: personalityType,
              answers: newAnswers as Json,
              user_id: session.user.id
            });

          if (insertError) throw insertError;

          // Update quiz progress
          const { data: progressData, error: progressError } = await supabase
            .from('quiz_progress')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (progressError && progressError.code !== 'PGRST116') {
            throw progressError;
          }

          if (!progressData) {
            // Create new progress record
            const { error: insertProgressError } = await supabase
              .from('quiz_progress')
              .insert({
                user_id: session.user.id,
                current_level: 1,
                completed_levels: [1]
              });

            if (insertProgressError) throw insertProgressError;
          }

        } catch (error: any) {
          console.error('Error saving results:', error);
          toast({
            title: "Error",
            description: "Failed to save your results. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handlePurchase = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase detailed results.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile?.id) {
        toast({
          title: "Error",
          description: "User profile not found.",
          variant: "destructive",
        });
        return;
      }

      const personalityType = calculatePersonalityType(answers);

      const { error } = await supabase
        .from('quiz_results')
        .insert({
          personality_type: personalityType,
          answers: answers as Json,
          user_id: profile.id
        });

      if (error) throw error;

      toast({
        title: "Results Saved!",
        description: "Your personality type has been saved to your profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    currentStep,
    currentQuestion,
    answers,
    questions,
    loading,
    error,
    handleStart,
    handleAnswer,
    handlePurchase,
    totalQuestions: questions.length,
    currentProgress: questions.length > 0 ? (currentQuestion / questions.length) * 100 : 0,
    personalityType: answers.length === questions.length ? calculatePersonalityType(answers) : null,
    currentQuestionData: questions[currentQuestion],
  };
};