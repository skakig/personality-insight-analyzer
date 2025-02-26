
import { supabase } from "@/integrations/supabase/client";

export const setupTestCoupon = async () => {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Add user as admin
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ id: session.user.id });

    if (adminError) {
      console.error('Error setting up admin:', adminError);
      return;
    }

    // Create a test coupon
    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: 'TEST50',
        discount_type: 'percentage',
        discount_amount: 50,
        is_active: true,
        max_uses: 100,
        created_by: session.user.id
      });

    if (couponError) {
      console.error('Error creating coupon:', couponError);
      return;
    }

    console.log('Successfully created test coupon: TEST50');
    return true;
  } catch (error) {
    console.error('Error in setup:', error);
    return false;
  }
};
