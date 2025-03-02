
export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  applicable_products: string[];
  affiliate_id?: string | null;
  created_by?: string | null;
  updated_at?: string;
}

export interface AdminSectionProps {
  userId: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  earnings: number;
  total_sales: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface AffiliateCommissionTier {
  id: string;
  min_sales: number;
  max_sales: number | null;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CouponListProps {
  coupons: Coupon[];
  onCouponUpdated: () => void;
  loading: boolean;
}
