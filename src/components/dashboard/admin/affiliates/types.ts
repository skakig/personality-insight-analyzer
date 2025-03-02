/**
 * Type definitions for affiliates
 */
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  created_at: string;
  updated_at?: string;
  conversions: number;
}

export interface CommissionTier {
  id: string;
  name: string;
  rate: number;
  description?: string;
  created_at: string;
}

export interface AffiliatePerformance {
  totalSales: number;
  conversionRate: number;
  recentSales: number;
  pendingCommission: number;
  totalCommission: number;
}
