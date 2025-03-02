import { supabase } from "@/integrations/supabase/client";

/**
 * Track affiliate commission for a purchase when an affiliate coupon is used
 */
export const trackAffiliatePurchase = async (
  couponCode: string | undefined | null, 
  purchaseAmount: number,
  productType?: string
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
    
    // Check if coupon is applicable to this product
    if (productType && coupon.applicable_products && 
        coupon.applicable_products.length > 0 && 
        !coupon.applicable_products.includes(productType)) {
      console.log('Coupon not applicable to this product type:', productType);
      return null;
    }
    
    const affiliate = coupon.affiliates;
    if (!affiliate) {
      console.log('Affiliate not found for coupon:', couponCode);
      return null;
    }
    
    console.log('Found affiliate for coupon:', affiliate.name);
    
    // Calculate commission based on affiliate's current rate
    const commissionRate = affiliate.commission_rate;
    const commissionAmount = purchaseAmount * commissionRate;
    
    console.log('Calculated commission:', {
      purchaseAmount,
      commissionRate,
      commissionAmount
    });
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // First, check if we already have an entry for this month
    const { data: existingPerformance, error: performanceError } = await supabase
      .from('affiliate_monthly_performance')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .eq('month', currentMonth)
      .maybeSingle();
      
    if (performanceError && !performanceError.message.includes('No rows found')) {
      console.error('Error checking monthly performance:', performanceError);
    }
    
    // If we have an entry, update it
    if (existingPerformance) {
      await supabase
        .from('affiliate_monthly_performance')
        .update({
          sales_amount: existingPerformance.sales_amount + purchaseAmount,
          commission_earned: existingPerformance.commission_earned + commissionAmount
        })
        .eq('id', existingPerformance.id);
    } else {
      // Otherwise, create a new entry
      await supabase
        .from('affiliate_monthly_performance')
        .insert({
          affiliate_id: affiliate.id,
          month: currentMonth,
          sales_amount: purchaseAmount,
          commission_earned: commissionAmount,
          commission_rate: commissionRate
        });
    }
    
    // Update affiliate stats
    const { error: updateError } = await supabase
      .from('affiliates')
      .update({
        total_sales: affiliate.total_sales + purchaseAmount,
        earnings: affiliate.earnings + commissionAmount,
        current_month_sales: affiliate.current_month_sales + purchaseAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);
      
    if (updateError) {
      console.error('Error updating affiliate stats:', updateError);
      return null;
    }
    
    // Track coupon usage
    await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: coupon.id,
        user_id: null, // Would be populated if user is logged in
        guest_email: null, // Would be populated if we have guest email
        purchase_amount: purchaseAmount,
        discount_amount: purchaseAmount * (coupon.discount_amount / 100) // Simplified calculation
      });
    
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

/**
 * Process monthly affiliate commission updates
 * This function should be run on a schedule (e.g., first day of each month)
 */
export const processMonthlyCommissionUpdates = async () => {
  try {
    console.log('Processing monthly affiliate commission updates');
    
    // Get previous month in YYYY-MM format
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const previousMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Get all active affiliates
    const { data: affiliates, error: affiliatesError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('status', 'active');
      
    if (affiliatesError) {
      throw affiliatesError;
    }
    
    // Get commission tiers
    const { data: tiers, error: tiersError } = await supabase
      .from('affiliate_commission_tiers')
      .select('*')
      .order('min_sales', { ascending: true });
      
    if (tiersError) {
      throw tiersError;
    }
    
    // Get previous month's performance data
    const { data: performances, error: performancesError } = await supabase
      .from('affiliate_monthly_performance')
      .select('*')
      .eq('month', previousMonth);
      
    if (performancesError) {
      throw performancesError;
    }
    
    // Calculate base commission rate (lowest tier)
    const baseRate = tiers.length > 0 ? tiers[0].commission_rate : 0.10;
    
    // For each affiliate, update commission rates based on previous month's performance
    for (const affiliate of affiliates) {
      // Find performance data for this affiliate
      const performance = performances.find(p => p.affiliate_id === affiliate.id);
      const previousSales = performance ? performance.sales_amount : 0;
      
      // Calculate new commission rate based on previous month's sales
      let newRate = baseRate;
      for (let i = tiers.length - 1; i >= 0; i--) {
        const tier = tiers[i];
        if (previousSales >= tier.min_sales && (tier.max_sales === null || previousSales <= tier.max_sales)) {
          newRate = tier.commission_rate;
          break;
        }
      }
      
      // Update affiliate with new rate and sales history
      await supabase
        .from('affiliates')
        .update({
          commission_rate: newRate,
          previous_month_sales: previousSales,
          current_month_sales: 0, // Reset for new month
          updated_at: new Date().toISOString()
        })
        .eq('id', affiliate.id);
    }
    
    console.log('Successfully processed monthly commission updates');
    return true;
  } catch (error) {
    console.error('Error processing monthly commission updates:', error);
    return false;
  }
};
