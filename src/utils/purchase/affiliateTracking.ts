
import { supabase } from "@/integrations/supabase/client";

/**
 * Track affiliate commission for a purchase when an affiliate coupon is used
 */
export const trackAffiliatePurchase = async (
  couponCode: string | undefined | null, 
  purchaseAmount: number
) => {
  if (!couponCode) return null;
  
  try {
    console.log('Tracking potential affiliate purchase with coupon:', couponCode);
    
    // First, get the coupon details to check if it's an affiliate coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*, affiliates(*)')
      .eq('code', couponCode)
      .single();
      
    if (couponError || !coupon || !coupon.affiliate_id) {
      console.log('Not an affiliate coupon or coupon not found:', couponError?.message);
      return null;
    }
    
    const affiliate = coupon.affiliates;
    if (!affiliate) {
      console.log('Affiliate not found for coupon:', couponCode);
      return null;
    }
    
    console.log('Found affiliate for coupon:', affiliate.name);
    
    // Calculate commission
    const commissionRate = affiliate.commission_rate;
    const commissionAmount = purchaseAmount * commissionRate;
    
    console.log('Calculated commission:', {
      purchaseAmount,
      commissionRate,
      commissionAmount
    });
    
    // Update affiliate stats
    const { error: updateError } = await supabase
      .from('affiliates')
      .update({
        total_sales: affiliate.total_sales + purchaseAmount,
        earnings: affiliate.earnings + commissionAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);
      
    if (updateError) {
      console.error('Error updating affiliate stats:', updateError);
      return null;
    }
    
    console.log('Successfully tracked affiliate purchase for:', affiliate.name);
    
    return {
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      commissionAmount,
      purchaseAmount
    };
  } catch (error) {
    console.error('Error tracking affiliate purchase:', error);
    return null;
  }
};
