
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: "active" | "inactive" | "pending" | string;
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string;
  conversions: number;
}

export interface CommissionTier {
  id: string;
  tier_name: string;
  commission_rate: number;
  min_sales: number;
  max_sales: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
