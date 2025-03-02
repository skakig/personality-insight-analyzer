
/**
 * Types for affiliate management functionality
 */

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  commission_rate: number;
  created_at: string;
  updated_at: string;
  code: string;
  total_sales: number;
  earnings: number;
  conversions: number;
}

export interface CommissionTier {
  id: string;
  name: string;
  rate: number;
  min_sales: number;
  max_sales: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAffiliateData {
  name: string;
  email: string;
  code: string;
  commission_rate: number;
}

export interface CreateCommissionTierData {
  name: string;
  rate: number;
  min_sales: number;
  max_sales: number;
}
