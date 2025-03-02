
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  status: string;
  commission_rate: number;
  user_id?: string;
  referral_code: string;
  code: string;
  earnings: number;
  conversions: number;
}

export interface CommissionTier {
  id: string;
  name: string;
  rate: number;
  min_referrals: number;
  max_referrals: number | null;
  created_at: string;
}
