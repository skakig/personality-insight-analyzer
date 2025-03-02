
export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  starts_at: string | null; // New field for coupon start date
  created_at: string;
  applicable_products: string[];
  affiliate_id?: string;
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
  // New fields for tracking monthly performance
  current_month_sales: number;
  previous_month_sales: number;
}

export interface AffiliateCommissionTier {
  id: string;
  min_sales: number;
  max_sales: number | null;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

// For affiliate performance tracking
export interface AffiliateMonthlyPerformance {
  id: string;
  affiliate_id: string;
  month: string; // Format: YYYY-MM
  sales_amount: number;
  commission_earned: number;
  commission_rate: number;
  created_at: string;
}

// For paginated admin views
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
