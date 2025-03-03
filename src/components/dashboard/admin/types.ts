
import { Quiz } from "@/types/quiz";

export interface AdminState {
  loading: boolean;
  error: string | null;
  coupons: Coupon[];
  affiliates: Affiliate[];
  commissionTiers: CommissionTier[];
}

export interface AdminSectionProps {
  userId?: string;
  title?: string;
  children?: React.ReactNode;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  affiliate_id: string | null;
  applicable_products: string[] | null;
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
  is_default?: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AffiliateFormData {
  name: string;
  email: string;
  code: string;
  commission_rate: number;
}

export interface CommissionTierFormData {
  tier_name: string;
  commission_rate: number;
  min_sales: number;
  max_sales: number | null;
  is_default: boolean;
}

// Alias for backwards compatibility
export type AffiliateCommissionTier = CommissionTier;
