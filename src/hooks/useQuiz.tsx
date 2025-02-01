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
        console.log('Fetching quiz questions...');
        const questions = await fetchQuizQuestions();
        console.log('Fetched questions:', questions);
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
    console.log('Handling answer:', { questionId, value });
    
    if (!session?.user) {
      console.error('No session found');
      toast({
        title: "Error",
        description: "You must be logged in to submit answers.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAnswers = { ...state.answers, [questionId]: value };
      console.log('New answers:', newAnswers);
      
      if (state.currentQuestionIndex < state.questions.length - 1) {
        console.log('Moving to next question');
        updateState({
          answers: newAnswers,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          currentQuestion: state.questions[state.currentQuestionIndex + 1]
        });
        updateProgress(state.currentQuestionIndex + 1, state.questions.length);
      } else {
        console.log('Quiz completed, calculating results');
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