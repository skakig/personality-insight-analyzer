
export interface QuizQuestion {
  id: string;
  question: string;
  level: number;
  category: string;
  weight?: number;
  subcategory?: string;
  explanation?: string;
  created_at?: string;
}

export interface QuizState {
  currentStep: 'welcome' | 'questions' | 'results';
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  answers: Record<string, number>;
  personalityType: string | null;
  progress: number;
  quizResultId: string | null;
}

// Add QuizResult type which was missing
export interface QuizResult {
  id: string;
  user_id?: string;
  personality_type: string;
  is_purchased: boolean;
  is_detailed: boolean;
  purchase_status?: 'pending' | 'completed' | null;
  access_method?: 'purchase' | 'free' | 'credit' | 'subscription' | 'forced_update' | null;
  stripe_session_id?: string;
  guest_email?: string;
  guest_access_token?: string;
  purchase_initiated_at?: string;
  purchase_completed_at?: string;
  created_at: string;
  updated_at?: string;
  detailed_analysis?: any;
  category_scores?: Record<string, number>;
}
