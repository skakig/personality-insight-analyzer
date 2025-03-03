
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
  user_id: string;
  personality_type: string;
  answers: any;
  created_at: string;
  updated_at?: string;
  category_scores: Record<string, number> | null;
  is_detailed: boolean;
  is_purchased: boolean;
  guest_access_expires_at?: string | null;
  guest_access_token?: string | null;
  temp_access_expires_at?: string | null;
  temp_access_token?: string;
  purchase_date?: string | null;
  purchase_amount?: number | null;
  purchase_initiated_at?: string | null;
  purchase_completed_at?: string | null;
  detailed_analysis?: string;
  access_method?: string;
  stripe_session_id?: string;
  guest_email?: string;
  purchase_status?: string;
  primary_level?: string | number | null;
  conversions?: number;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: string;
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string | null;
  conversions?: number;
}

export interface CommissionTier {
  id: string;
  tier_name?: string;
  commission_rate: number;
  min_sales: number;
  max_sales: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_default?: boolean;
}

export interface UseAssessmentResultProps {
  id?: string;
  sessionId?: string;
  email?: string;
}
