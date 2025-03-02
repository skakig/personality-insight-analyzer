
// Admin section types
export interface AdminSectionProps {
  userId?: string;
}

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  max_uses: number | null;
  current_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  affiliate_id: string | null;
  applicable_products: string[];
}

// Affiliate types
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  total_sales: number;
  earnings: number;
  conversions: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface CommissionTier {
  id: string;
  min_sales: number;
  max_sales: number | null;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

// Alias for backwards compatibility
export type AffiliateCommissionTier = CommissionTier;
