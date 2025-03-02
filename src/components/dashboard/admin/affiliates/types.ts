
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

export { Affiliate, CommissionTier }; // Export these types
export type AffiliateResult = Affiliate; // For backwards compatibility
