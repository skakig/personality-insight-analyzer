
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

export interface QuizResult {
  id: string;
  user_id?: string | null;
  personality_type: string;
  is_purchased: boolean;
  is_detailed: boolean;
  purchase_status?: 'pending' | 'completed' | null;
  access_method?: 'purchase' | 'free' | 'credit' | 'subscription' | 'forced_update' | null;
  stripe_session_id?: string | null;
  guest_email?: string | null;
  guest_access_token?: string | null;
  purchase_initiated_at?: string | null;
  purchase_completed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  detailed_analysis?: any;
  category_scores?: Record<string, number> | null;
  answers?: any;
  temp_access_token?: string | null;
  temp_access_expires_at?: string | null;
  guest_access_expires_at?: string | null;
  purchase_date?: string | null;
  purchase_amount?: number | null;
}
