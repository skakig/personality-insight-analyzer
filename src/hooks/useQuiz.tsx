
import { useState, useEffect, useCallback } from "react";
import { QuizQuestion, QuizState } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { calculatePersonalityType } from "@/utils/personalityCalculator";

export type QuizStep = 'welcome' | 'questions' | 'results';

export const useQuiz = (session: any) => {
  const [state, setState] = useState<QuizState>({
    currentStep: 'welcome',
    questions: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    loading: true,
    error: null,
    answers: {},
    personalityType: null,
    progress: 0,
    quizResultId: null,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('level', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error('No questions found');
        }
        
        setState(prev => ({
          ...prev,
          questions: data,
          loading: false
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };
    
    fetchQuestions();
  }, []);

  const handleStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'questions',
      currentQuestion: prev.questions[0],
      currentQuestionIndex: 0,
      progress: 0
    }));
  }, []);

  const handleAnswer = useCallback(async (questionId: string, value: number) => {
    setState(prev => {
      const newAnswers = { ...prev.answers, [questionId]: value };
      const nextIndex = prev.currentQuestionIndex + 1;
      const nextQuestion = nextIndex < prev.questions.length ? prev.questions[nextIndex] : null;
      const progress = (nextIndex / prev.questions.length) * 100;
      
      if (!nextQuestion) {
        const personalityType = calculatePersonalityType(newAnswers);
        
        saveResultsToDatabase(newAnswers, personalityType, session?.user?.id);
        
        return {
          ...prev,
          answers: newAnswers,
          currentStep: 'results',
          personalityType,
          progress: 100
        };
      }
      
      return {
        ...prev,
        answers: newAnswers,
        currentQuestion: nextQuestion,
        currentQuestionIndex: nextIndex,
        progress
      };
    });
  }, [session]);

  const saveResultsToDatabase = async (answers: Record<string, number>, personalityType: string, userId?: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId || null,
          answers,
          personality_type: personalityType,
          category_scores: { /* Add category scores calculation if needed */ }
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving quiz results:', error);
        return;
      }
      
      console.log('Quiz results saved successfully:', data.id);
      
      setState(prev => ({
        ...prev,
        quizResultId: data.id
      }));
      
    } catch (error) {
      console.error('Error in saveResultsToDatabase:', error);
    }
  };

  return {
    handleAnswer,
    handleStart,
    currentStep: state.currentStep,
    questions: state.questions,
    currentQuestion: state.currentQuestion || state.questions[0],
    loading: state.loading,
    error: state.error,
    personalityType: state.personalityType,
    progress: state.progress,
    quizResultId: state.quizResultId
  };
};
