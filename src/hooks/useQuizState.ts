
import { useState } from 'react';
import { QuizQuestion } from '@/types/quiz';

export type QuizStep = 'welcome' | 'questions' | 'results';

export interface QuizState {
  currentStep: QuizStep;
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  answers: Record<string, number>;
  personalityType: string | null;
  progress: number;
}

const initialState: QuizState = {
  currentStep: 'welcome',
  questions: [],
  currentQuestion: null,
  currentQuestionIndex: 0,
  loading: false, // Changed from true to false
  error: null,
  answers: {},
  personalityType: null,
  progress: 0
};

export const useQuizState = () => {
  const [state, setState] = useState<QuizState>(initialState);

  const updateState = (updates: Partial<QuizState>) => {
    console.log('Updating quiz state:', { current: state, updates });
    setState(prev => ({ ...prev, ...updates }));
  };

  const setQuestions = (questions: QuizQuestion[]) => {
    console.log('Setting questions:', { count: questions.length });
    updateState({
      questions,
      currentQuestion: questions[0],
      loading: false
    });
  };

  const setError = (error: string) => {
    console.error('Quiz error:', error);
    updateState({
      error,
      loading: false
    });
  };

  const updateProgress = (currentQuestionIndex: number, totalQuestions: number) => {
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    console.log('Updating progress:', { currentQuestionIndex, totalQuestions, progress });
    updateState({ progress });
  };

  return {
    state,
    updateState,
    setQuestions,
    setError,
    updateProgress
  };
};
