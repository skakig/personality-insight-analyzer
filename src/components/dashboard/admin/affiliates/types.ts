
export type AffiliateStatus = "active" | "inactive" | "pending";

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: AffiliateStatus;
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionTier {
  id: string;
  name: string;
  rate: number;
  min_sales: number;
  description?: string;
  created_at: string;
  updated_at: string;
}
