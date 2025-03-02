
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  status: "active" | "inactive" | "pending";
  commission_rate: number;
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string;
  conversions: number; // Making this required, not optional
}

export interface CommissionTier {
  id: string;
  min_sales: number;
  max_sales: number | null;
  commission_rate: number;
  created_at: string;
}

export interface NewAffiliateFormData {
  name: string;
  email: string;
  code: string;
  commission_rate: number;
}

export interface AffiliatePerformanceCardProps {
  statTitle: string;
  statValue: string;
  statDescription: string;
  trend?: "up" | "down" | "neutral";
}
