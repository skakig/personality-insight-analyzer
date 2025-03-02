
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
}

export interface AdminSectionProps {
  userId: string;
}
