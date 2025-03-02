
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-deno-subhost',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { basePrice, couponCode, returnUrl, cancelUrl } = await req.json();
    console.log('Book checkout requested:', { basePrice, couponCode, returnUrl });

    // Validate input
    if (!basePrice || !returnUrl) {
      throw new Error('Missing required parameters: basePrice and returnUrl are required');
    }

    let finalPrice = basePrice;
    let appliedCoupon = null;

    // Handle coupon if provided
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (couponError) {
        console.error('Error fetching coupon:', couponError);
      } else if (coupon) {
        // Check if coupon can be applied to books
        const applicableToBooks = !coupon.applicable_products || 
                                coupon.applicable_products.length === 0 || 
                                coupon.applicable_products.includes('book');
        
        if (!applicableToBooks) {
          console.log('Coupon not applicable to books');
        } else if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
          console.log('Coupon has reached maximum uses');
        } else if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          console.log('Coupon has expired');
        } else {
          appliedCoupon = coupon;
          
          // Calculate discount
          if (coupon.discount_type === 'percentage') {
            const discountAmount = Math.round(basePrice * (coupon.discount_amount / 100));
            finalPrice = Math.max(0, basePrice - discountAmount);
          } else {
            finalPrice = Math.max(0, basePrice - coupon.discount_amount);
          }
          
          console.log(`Applied coupon ${couponCode}:`, { 
            originalPrice: basePrice, 
            finalPrice, 
            discountType: coupon.discount_type, 
            discountAmount: coupon.discount_amount 
          });
        }
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Moral Hierarchy Book',
              description: 'Pre-order of The Moral Hierarchy book with exclusive bonus materials',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: returnUrl,
      cancel_url: cancelUrl || returnUrl.replace('success=true', 'canceled=true'),
      metadata: {
        product_type: 'book',
        coupon_code: couponCode || null,
        applied_discount: appliedCoupon ? (finalPrice - basePrice) : 0,
        original_price: basePrice
      },
    });

    // If coupon was applied, increment the usage counter
    if (appliedCoupon) {
      await supabase
        .from('coupons')
        .update({ current_uses: (appliedCoupon.current_uses || 0) + 1 })
        .eq('id', appliedCoupon.id);
        
      // Record coupon usage
      await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: appliedCoupon.id,
          purchase_amount: basePrice,
          discount_amount: basePrice - finalPrice,
          guest_email: null // We don't have user email at this point
        });
    }

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        discountAmount: appliedCoupon ? (basePrice - finalPrice) : 0
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Book checkout error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
