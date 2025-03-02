
import { Affiliate, CommissionTier } from "@/types/quiz";

export interface AffiliateFormValues {
  id?: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: string;
}

export interface AffiliateDetailsProps {
  affiliate: Affiliate;
  onClose: () => void;
  onRefresh: () => void;
}

export interface AffiliateListProps {
  affiliates: Affiliate[];
  onSelect: (affiliate: Affiliate) => void;
  onRefresh: () => void;
}

export interface CommissionTierListProps {
  tiers: CommissionTier[];
  onRefresh: () => void;
}

export interface CreateCommissionTierFormProps {
  onSuccess: () => void;
}

export interface AffiliatePerformanceCardProps {
  affiliate: Affiliate;
}

export interface CreateAffiliateFormProps {
  onSuccess: () => void;
}

export interface AffiliateResult {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  status: string;
  total_sales: number;
  earnings: number;
  created_at: string;
  updated_at: string;
  conversions: number;
}
