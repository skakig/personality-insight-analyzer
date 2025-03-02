
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log('Checkout request:', requestData);
    
    // Get required parameters
    const {
      resultId,
      userId,
      email,
      priceAmount = 1499, // Default $14.99
      couponCode,
      mode = 'payment',
      metadata = {},
      returnUrl
    } = requestData;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    // Default URLs
    const origin = new URL(req.url).origin;
    const defaultReturnUrl = resultId 
      ? `${origin}/assessment/${resultId}?success=true`
      : `${origin}/dashboard?success=true`;
    
    const successUrl = returnUrl || defaultReturnUrl;
    const cancelUrl = `${origin}/dashboard?canceled=true`;

    // Format price and product details
    let finalPrice = priceAmount;
    let discountAmount = 0;
    let discountType = '';

    // Check for coupon if provided
    if (couponCode) {
      console.log('Validating coupon:', couponCode);
      try {
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
          console.log('Invalid coupon code');
          // Continue without applying coupon
        } else {
          // Check if coupon has expired or reached max uses
          if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            console.log('Coupon expired');
            // Continue without applying coupon
          } 
          else if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            console.log('Coupon reached max uses');
            // Continue without applying coupon
          } 
          else {
            // Apply valid coupon
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
              originalPrice: priceAmount,
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
        // Continue without applying coupon
      }
    }

    // Set up session parameters
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Detailed Assessment Report',
              description: 'Full assessment analysis and personalized insights',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        resultId,
        userId: userId || '',
        couponCode: couponCode || '',
        discountAmount,
        discountType: discountType || '',
      },
    };

    // Add customer email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // If resultId is provided, update the result with stripe session ID
    if (resultId) {
      try {
        await supabase
          .from('quiz_results')
          .update({
            stripe_session_id: session.id,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', resultId);
      } catch (error) {
        console.error('Error updating quiz result:', error);
        // Continue anyway, this shouldn't block checkout
      }
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        discountAmount,
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
