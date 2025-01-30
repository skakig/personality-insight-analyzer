import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { calculatePersonalityType } from "@/utils/personalityCalculator";
import { fetchQuizQuestions, saveQuizResults, updateQuizProgress } from "@/utils/quizUtils";
import { useQuizState } from "./useQuizState";

export const useQuiz = (session: Session | null) => {
  const { state, updateState, setQuestions, setError, updateProgress } = useQuizState();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await fetchQuizQuestions();
        setQuestions(questions);
      } catch (err: any) {
        console.error('Error in fetchQuestions:', err);
        setError(err.message || 'Failed to load quiz questions');
        toast({
          title: "Error",
          description: "Failed to load quiz questions. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadQuestions();
  }, []);

  const handleStart = () => {
    updateState({ currentStep: "questions" });
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
        updateState({
          answers: newAnswers,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          currentQuestion: state.questions[state.currentQuestionIndex + 1]
        });
        updateProgress(state.currentQuestionIndex + 1, state.questions.length);
      } else {
        const answersArray = Object.values(newAnswers);
        const personalityType = calculatePersonalityType(answersArray);
        
        await saveQuizResults(personalityType, session.user.id, newAnswers);
        await updateQuizProgress(session.user.id);

        updateState({
          answers: newAnswers,
          personalityType,
          currentStep: "results",
          progress: 100
        });

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

  return {
    ...state,
    handleAnswer,
    handleStart
  };
};