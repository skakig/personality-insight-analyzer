export interface Assessment {
  id: string;
  personality_type: string;
  created_at: string;
  is_purchased: boolean;
  is_detailed: boolean;
  access_method: string | null;
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