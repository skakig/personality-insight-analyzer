
export interface Assessment {
  id: string;
  personality_type: string;
  created_at: string;
  updated_at?: string | null;
  is_purchased: boolean;
  is_detailed: boolean;
  access_method: string | null;
  primary_level?: string | number | null;
  conversions?: number;
}

export interface Subscription {
  subscription_tier: string;
  max_assessments: number;
  assessments_used: number;
  active: boolean;
}

export interface SubscriptionCardProps {
  subscription: Subscription | null;
  error: string | null;
}

export interface RecentAssessmentsCardProps {
  assessments: Assessment[];
  subscription: Subscription | null;
  hasAvailableCredits: boolean;
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
  conversions: number;
}

export interface CommissionTier {
  id: string;
  tier_name?: string;
  commission_rate: number;
  min_sales: number;
  max_sales: number | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}
