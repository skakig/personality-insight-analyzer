
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: "active" | "inactive" | "pending";
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string;
  conversions: number; // Required property
}

export interface CommissionTier {
  id: string;
  tier_name: string;
  commission_rate: number;
  min_sales: number;
  max_sales: number; // Making this required to match other definition
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
