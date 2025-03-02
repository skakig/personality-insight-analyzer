
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      resultId,
      email,
      userId,
      priceAmount = 1499, // Default price: $14.99
      productType = 'report',
      mode = 'payment',
      couponCode,
      metadata = {}
    } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Create checkout session request received:', {
      resultId,
      email: email ? `${email.substring(0, 3)}...` : undefined,
      userId: userId ? `${userId.substring(0, 8)}...` : undefined,
      priceAmount,
      productType,
      mode,
      hasCouponCode: !!couponCode,
      timestamp: new Date().toISOString()
    });

    // Set up the basic checkout session parameters
    let sessionParams: any = {
      mode: mode,
      success_url: `${metadata.returnUrl || 'https://themoralhierarchy.com/assessment/'+resultId}?success=true`,
      cancel_url: `${metadata.returnUrl?.split('?')[0] || 'https://themoralhierarchy.com/assessment/'+resultId}?success=false`,
      client_reference_id: resultId,
      metadata: {
        ...metadata,
        resultId,
        userId,
        email
      }
    };

    // Add customer email if available
    if (email) {
      sessionParams.customer_email = email;
    }

    // Set line items based on product type
    if (productType === 'credits') {
      sessionParams.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Assessment Credits',
            description: 'Credits for The Moral Hierarchy assessments'
          },
          unit_amount: priceAmount,
        },
        quantity: 1,
      }];
    } else if (productType === 'subscription') {
      // For subscription products, we need a price ID
      sessionParams.line_items = [{
        price: metadata.priceId,
        quantity: 1,
      }];
    } else {
      // Default to single report purchase
      sessionParams.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Full Moral Hierarchy Report',
            description: 'Detailed assessment report'
          },
          unit_amount: priceAmount,
        },
        quantity: 1,
      }];
    }

    // Apply coupon code if provided
    let appliedDiscount = 0;
    
    if (couponCode) {
      console.log('Coupon code provided:', couponCode);
      
      try {
        // Fetch coupon details from the database
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
        
        const response = await fetch(`${supabaseUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(couponCode)}&select=*`, {
          headers: {
            'Content-Type': 'application/json',
            'apiKey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch coupon data');
        }
        
        const coupons = await response.json();
        const coupon = coupons[0];
        
        if (coupon && coupon.is_active && 
            (!coupon.max_uses || coupon.current_uses < coupon.max_uses) &&
            (!coupon.expires_at || new Date(coupon.expires_at) > new Date())) {
          
          console.log('Valid coupon found:', {
            code: coupon.code,
            type: coupon.discount_type,
            amount: coupon.discount_amount
          });
          
          // Calculate discount
          if (coupon.discount_type === 'percentage') {
            appliedDiscount = Math.round(priceAmount * (coupon.discount_amount / 100));
            
            // Apply discount to line items
            sessionParams.line_items[0].price_data.unit_amount = priceAmount - appliedDiscount;
          } else if (coupon.discount_type === 'fixed') {
            appliedDiscount = Math.min(priceAmount, coupon.discount_amount);
            
            // Apply discount to line items
            sessionParams.line_items[0].price_data.unit_amount = priceAmount - appliedDiscount;
          }
          
          console.log('Applied discount:', {
            originalPrice: priceAmount,
            discountAmount: appliedDiscount,
            finalPrice: sessionParams.line_items[0].price_data.unit_amount
          });
          
          // Add coupon information to metadata
          sessionParams.metadata.couponCode = coupon.code;
          sessionParams.metadata.discountAmount = appliedDiscount;
        } else {
          console.log('Coupon not valid:', couponCode);
        }
      } catch (couponError) {
        console.error('Error applying coupon:', couponError);
        // Continue checkout without coupon if there's an error
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url,
      originalAmount: priceAmount,
      discountAmount: appliedDiscount,
      finalAmount: sessionParams.line_items[0].price_data.unit_amount
    });

    return new Response(
      JSON.stringify({
        id: session.id,
        url: session.url,
        sessionId: session.id,
        discountAmount: appliedDiscount
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
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
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
