
import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { calculatePersonalityType } from "@/utils/personalityCalculator";
import { fetchQuizQuestions } from "@/utils/quizUtils";
import { useQuizState } from "./useQuizState";
import { supabase } from "@/integrations/supabase/client";

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

    if (state.currentStep === "questions") {
      loadQuestions();
    }
  }, [state.currentStep]);

  const handleStart = () => {
    updateState({ currentStep: "questions", loading: true });
  };

  const handleAnswer = async (questionId: string, value: number) => {
    console.log('Handling answer:', { questionId, value });
    
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
        
        updateState({
          answers: newAnswers,
          personalityType,
          currentStep: "results",
          progress: 100
        });

        // Only save results if user is authenticated
        if (session?.user) {
          try {
            const { error: resultsError } = await supabase
              .from('quiz_results')
              .insert({
                user_id: session.user.id,
                personality_type: personalityType,
                answers: newAnswers
              });

            if (resultsError) throw resultsError;

            const { error: progressError } = await supabase
              .from('quiz_progress')
              .upsert({
                user_id: session.user.id,
                current_level: parseInt(personalityType),
                completed_levels: [parseInt(personalityType)]
              });

            if (progressError) throw progressError;

          } catch (error) {
            console.error('Error saving results:', error);
            // Continue showing results even if saving fails
          }
        }

        toast({
          title: "Success",
          description: "Quiz completed successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error handling answer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your answer. Please try again.",
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
