
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
    const { 
      resultId, 
      userId, 
      email, 
      priceAmount = 1499, 
      couponCode,
      mode = 'payment', 
      productType = 'assessment',
      amount = 1,
      metadata = {}
    } = await req.json();

    console.log('Creating checkout session:', { 
      resultId, 
      userId, 
      priceAmount, 
      couponCode, 
      mode,
      productType
    });

    let finalPrice = priceAmount;
    let appliedCoupon = null;
    let affiliateId = null;

    // Handle coupon code if provided
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
        // Check if coupon applies to this product
        const isApplicable = !coupon.applicable_products || 
                           coupon.applicable_products.length === 0 || 
                           coupon.applicable_products.includes(productType);
        
        if (!isApplicable) {
          console.log(`Coupon not applicable to ${productType}`);
        } else if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
          console.log('Coupon has reached maximum uses');
        } else if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          console.log('Coupon has expired');
        } else {
          appliedCoupon = coupon;
          affiliateId = coupon.affiliate_id;
          
          // Calculate discount
          if (coupon.discount_type === 'percentage') {
            const discountAmount = Math.round(priceAmount * (coupon.discount_amount / 100));
            finalPrice = Math.max(0, priceAmount - discountAmount);
          } else {
            finalPrice = Math.max(0, priceAmount - coupon.discount_amount);
          }
          
          console.log(`Applied coupon ${couponCode}:`, { 
            originalPrice: priceAmount, 
            finalPrice, 
            discountType: coupon.discount_type, 
            discountAmount: coupon.discount_amount 
          });
        }
      }
    }

    // Determine what product to sell based on the productType
    let lineItems = [];
    
    if (productType === 'assessment') {
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Detailed Assessment Report',
            description: 'Full analysis of your Moral Hierarchy assessment',
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }];
    } else if (productType === 'credits') {
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Assessment Credits',
            description: `${amount} assessment credits`,
          },
          unit_amount: 1499,
        },
        quantity: amount,
      }];
    } else if (productType === 'book') {
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'The Moral Hierarchy Book',
            description: 'Pre-order of The Moral Hierarchy book',
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }];
    }

    // Combine with any additional metadata
    const sessionMetadata = {
      resultId: resultId || null,
      userId: userId || null,
      email: email || null,
      product_type: productType,
      coupon_code: couponCode || null,
      applied_discount: appliedCoupon ? (priceAmount - finalPrice) : 0,
      affiliate_id: affiliateId,
      ...metadata
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      success_url: metadata.returnUrl || `${req.headers.get('origin')}/assessment/${resultId || ''}?success=true`,
      cancel_url: metadata.cancelUrl || `${req.headers.get('origin')}/assessment/${resultId || ''}?canceled=true`,
      metadata: sessionMetadata,
    });

    // If we have a userId, record the purchase
    if (resultId) {
      await supabase
        .from('quiz_results')
        .update({
          stripe_session_id: session.id,
          purchase_initiated_at: new Date().toISOString(),
          purchase_status: 'pending'
        })
        .eq('id', resultId);
    }

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
          user_id: userId || null,
          guest_email: !userId && email ? email : null,
          purchase_amount: priceAmount,
          discount_amount: priceAmount - finalPrice
        });
    }

    console.log('Checkout session created successfully');
    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        discountAmount: appliedCoupon ? (priceAmount - finalPrice) : 0
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
    console.error('Checkout error:', error);
    
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
