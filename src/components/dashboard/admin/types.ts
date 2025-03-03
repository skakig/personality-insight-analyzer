
import { QuizResult } from "@/types/quiz";

export interface AdminDashboardProps {
  session: any;
}

export interface CouponFormValues {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  max_uses: number | null;
  expires_at: Date | null;
  affiliate_id?: string | null;
  applicable_products?: string[];
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
  affiliate_id: string | null;
  applicable_products: string[];
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalRedeemed: number;
  topCoupon: Coupon | null;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string | null;
  used_at: string;
  purchase_amount: number;
  discount_amount: number;
  guest_email: string | null;
}

export interface SchemaType {
  current_version: number;
  needs_update: boolean;
  recommended_version: number;
}
