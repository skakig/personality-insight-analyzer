
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
    // Parse request
    const { priceId, mode = 'subscription', metadata = {}, couponCode } = await req.json();
    console.log('Creating subscription session:', { priceId, mode, couponCode });

    // Validate input
    if (!priceId) {
      throw new Error('Missing required parameter: priceId');
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId);
    if (!price) {
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    let discountAmount = 0;
    let affiliateId = null;
    const lineItems = [{
      price: priceId,
      quantity: 1,
    }];

    // Handle coupon if provided
    if (couponCode) {
      // Check if coupon exists and is valid
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (couponError) {
        console.error('Error fetching coupon:', couponError);
      } else if (coupon) {
        // Check if coupon applies to subscriptions
        const isApplicable = !coupon.applicable_products || 
                           coupon.applicable_products.length === 0 || 
                           coupon.applicable_products.includes('subscription');
        
        if (!isApplicable) {
          console.log('Coupon not applicable to subscriptions');
        } else if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
          console.log('Coupon has reached maximum uses');
        } else if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          console.log('Coupon has expired');
        } else {
          // Calculate discount
          if (price.unit_amount) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = Math.round(price.unit_amount * (coupon.discount_amount / 100));
            } else {
              discountAmount = coupon.discount_amount;
            }
          }
          
          affiliateId = coupon.affiliate_id;
          
          // Apply coupon in DB
          await supabase
            .from('coupons')
            .update({ current_uses: (coupon.current_uses || 0) + 1 })
            .eq('id', coupon.id);
            
          console.log(`Applied coupon ${couponCode}:`, { 
            originalPrice: price.unit_amount, 
            discountAmount,
            discountType: coupon.discount_type
          });
        }
      }
    }

    // Enhanced metadata
    const enhancedMetadata = {
      productType: 'subscription',
      priceId,
      couponCode: couponCode || null,
      discountAmount,
      affiliateId,
      ...metadata
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${req.headers.get('origin')}/dashboard?subscribed=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: enhancedMetadata,
      ...(discountAmount > 0 && price.unit_amount ? {
        discounts: [{
          coupon: await stripe.coupons.create({
            amount_off: discountAmount,
            currency: price.currency,
            duration: 'once',
            name: `Coupon ${couponCode}`
          })
        }]
      } : {})
    });

    // If we have an affiliateId and discount was applied, record usage
    if (affiliateId && discountAmount > 0 && price.unit_amount) {
      await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: affiliateId,
          purchase_amount: price.unit_amount,
          discount_amount: discountAmount
        });
    }

    console.log('Subscription session created successfully:', session.id);
    
    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
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
    console.error('Subscription error:', error);
    
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
