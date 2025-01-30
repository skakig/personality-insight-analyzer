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

export interface QuizState {
  currentStep: "welcome" | "questions" | "results";
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  answers: Record<string, number>;
  personalityType: string | null;
  progress: number;
}

export const useQuiz = (session: Session | null) => {
  const [state, setState] = useState<QuizState>({
    currentStep: "welcome",
    questions: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    loading: true,
    error: null,
    answers: {},
    personalityType: null,
    progress: 0
  });

  const fetchQuestions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error: fetchError } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);
      if (!data || data.length === 0) throw new Error('No questions available');

      setState(prev => ({ 
        ...prev, 
        questions: data,
        currentQuestion: data[0],
        loading: false 
      }));
    } catch (err: any) {
      console.error('Error in fetchQuestions:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to load quiz questions',
        loading: false
      }));
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStart = () => {
    setState(prev => ({ ...prev, currentStep: "questions" }));
  };

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
      const newAnswers = { ...state.answers, [questionId]: value };
      
      if (state.currentQuestionIndex < state.questions.length - 1) {
        setState(prev => ({
          ...prev,
          answers: newAnswers,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          currentQuestion: prev.questions[prev.currentQuestionIndex + 1],
          progress: ((prev.currentQuestionIndex + 1) / prev.questions.length) * 100
        }));
      } else {
        // Convert answers object to array for personality calculation
        const answersArray = Object.values(newAnswers);
        const personalityType = calculatePersonalityType(answersArray);
        
        await saveQuizResults(personalityType, session.user.id, newAnswers);
        await handleQuizProgress(session.user.id);

        setState(prev => ({
          ...prev,
          answers: newAnswers,
          personalityType,
          currentStep: "results",
          progress: 100
        }));

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

  const saveQuizResults = async (personalityType: string, userId: string, answers: Record<string, number>) => {
    const { error: insertError } = await supabase
      .from('quiz_results')
      .insert({
        personality_type: personalityType,
        answers,
        user_id: userId
      });

    if (insertError) throw insertError;
  };

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

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    ...state,
    handleAnswer,
    handleStart
  };
};