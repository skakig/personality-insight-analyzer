
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Get request data with url parameters
  const url = new URL(req.url);
  // Default redirect URL in case request doesn't provide one
  const defaultReturnUrl = `${url.origin}/book`;
  const defaultCancelUrl = `${url.origin}/book`;

  // Set default redirect URLs
  let successUrl = defaultReturnUrl + '?success=true';
  let cancelUrl = defaultCancelUrl + '?canceled=true';

  try {
    // Parse request body
    const requestData = await req.json();
    console.log('Book checkout request data:', requestData);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // If request provides custom URLs, use those instead
    if (requestData.returnUrl) {
      successUrl = requestData.returnUrl;
      if (!successUrl.includes('?')) {
        successUrl += '?success=true';
      } else if (!successUrl.includes('success=')) {
        successUrl += '&success=true';
      }
    }
    if (requestData.cancelUrl) {
      cancelUrl = requestData.cancelUrl;
    }

    // Check for coupon code
    let couponCode = requestData.couponCode;
    let discountAmount = 0;
    let discountType = '';
    let finalPrice = requestData.basePrice || 2999; // Default to $29.99 for the book
    
    // Apply coupon if provided
    if (couponCode) {
      console.log('Checking coupon:', couponCode);
      try {
        // Fetch coupon from the database
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .eq('is_active', true)
          .maybeSingle();
          
        if (couponError) {
          console.error('Coupon fetch error:', couponError);
          throw new Error('Failed to validate coupon');
        }
        
        if (!coupon) {
          console.log('Coupon not found or inactive');
          // Continue without a coupon
        } else {
          // Check if coupon has reached max uses
          if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            console.log('Coupon reached max uses');
            // Continue without a coupon
          } 
          // Check if coupon is expired
          else if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            console.log('Coupon expired');
            // Continue without a coupon
          } 
          // Apply valid coupon
          else {
            console.log('Valid coupon found:', coupon);
            discountType = coupon.discount_type;
            
            if (discountType === 'percentage') {
              // Calculate percentage discount
              discountAmount = Math.round(finalPrice * (coupon.discount_amount / 100));
            } else {
              // Fixed amount discount
              discountAmount = coupon.discount_amount;
            }
            
            // Apply discount to final price
            finalPrice = Math.max(0, finalPrice - discountAmount);
            
            console.log('Applied discount:', {
              originalPrice: requestData.basePrice || 2999,
              discountAmount,
              finalPrice,
              discountType
            });
            
            // Increment coupon usage counter
            try {
              const { error: updateError } = await supabase
                .from('coupons')
                .update({ 
                  current_uses: (coupon.current_uses || 0) + 1 
                })
                .eq('id', coupon.id);
                
              if (updateError) {
                console.error('Error updating coupon usage:', updateError);
                // Continue anyway, this shouldn't block checkout
              }
            } catch (e) {
              console.error('Failed to increment coupon usage:', e);
              // Continue anyway, this shouldn't block checkout
            }
          }
        }
      } catch (error) {
        console.error('Error processing coupon:', error);
        // Continue without applying the coupon
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Moral Hierarchy Book',
              description: 'Pre-order for the forthcoming book "The Moral Hierarchy"',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: requestData.email || undefined,
      metadata: {
        productType: 'book',
        couponCode: couponCode || '',
        discountAmount: discountAmount,
        discountType: discountType || '',
      },
    });

    // Return success with session ID and URL
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        discountAmount: discountAmount,
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
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session',
      }),
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
