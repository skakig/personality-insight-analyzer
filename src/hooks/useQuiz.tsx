
import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { calculatePersonalityType } from "@/utils/personalityCalculator";
import { fetchQuizQuestions } from "@/utils/quizUtils";
import { useQuizState } from "./useQuizState";
import { supabase } from "@/integrations/supabase/client";
import { QuizState } from "@/types/quiz";

export const useQuiz = (session: Session | null) => {
  const { state, updateState, setQuestions, setError, updateProgress } = useQuizState();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (state.currentStep === "questions" && state.questions.length === 0) {
          console.log('Starting to fetch quiz questions...');
          updateState({ loading: true });
          
          const questions = await fetchQuizQuestions();
          console.log('Questions fetched successfully:', {
            count: questions?.length,
            firstQuestion: questions?.[0]?.question
          });
          
          if (!questions || questions.length === 0) {
            throw new Error('No questions were returned from the database');
          }
          
          setQuestions(questions);
        }
      } catch (err: any) {
        console.error('Error in loadQuestions:', {
          error: err,
          message: err.message,
          state: state
        });
        setError(err.message || 'Failed to load quiz questions');
        toast({
          title: "Error Loading Questions",
          description: err.message || "Failed to load quiz questions. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadQuestions();
  }, [state.currentStep]);

  const handleStart = () => {
    console.log('Starting quiz...', { currentState: state });
    updateState({ 
      currentStep: "questions", 
      loading: true,
      error: null 
    });
  };

  const handleAnswer = async (questionId: string, value: number) => {
    console.log('Processing answer:', { questionId, value, currentIndex: state.currentQuestionIndex });
    
    try {
      const newAnswers = { ...state.answers, [questionId]: value };
      
      if (state.currentQuestionIndex < state.questions.length - 1) {
        console.log('Moving to next question:', { 
          currentIndex: state.currentQuestionIndex,
          nextIndex: state.currentQuestionIndex + 1,
          totalQuestions: state.questions.length 
        });
        
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

        // Generate temporary access token for guest users
        const tempAccessToken = session?.user ? null : crypto.randomUUID();
        const tempAccessExpiresAt = session?.user ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Create quiz result
        const { data: quizResult, error: resultError } = await supabase
          .from('quiz_results')
          .insert({
            personality_type: personalityType,
            answers: newAnswers,
            user_id: session?.user?.id || null,
            temp_access_token: tempAccessToken,
            temp_access_expires_at: tempAccessExpiresAt
          })
          .select('*')
          .single();

        if (resultError) {
          console.error('Error saving quiz results:', resultError);
          throw resultError;
        }

        if (!session?.user && tempAccessToken) {
          localStorage.setItem('guestQuizResultId', quizResult.id);
          localStorage.setItem('guestAccessToken', tempAccessToken);
        }

        const updates: Partial<QuizState> = {
          answers: newAnswers,
          personalityType,
          currentStep: "results",
          progress: 100
        };

        if (quizResult?.id) {
          updates.quizResultId = quizResult.id;
        }

        updateState(updates);

        // Update quiz progress for logged-in users
        if (session?.user) {
          try {
            const { error: progressError } = await supabase
              .from('quiz_progress')
              .upsert({
                user_id: session.user.id,
                current_level: parseInt(personalityType),
                completed_levels: [parseInt(personalityType)]
              });

            if (progressError) {
              console.error('Error updating quiz progress:', progressError);
              throw progressError;
            }
          } catch (error: any) {
            console.error('Error saving progress:', {
              error,
              userId: session.user.id,
              personalityType
            });
            toast({
              title: "Warning",
              description: "Your results were calculated but couldn't be saved. You can still view them.",
              variant: "destructive",
            });
          }
        }

        toast({
          title: "Success",
          description: "Quiz completed successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error handling answer:', {
        error,
        questionId,
        value,
        state
      });
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
