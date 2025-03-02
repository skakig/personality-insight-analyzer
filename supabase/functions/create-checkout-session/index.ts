
import { serve } from 'http/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Handle CORS for preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const { 
      resultId, 
      userId, 
      email, 
      priceAmount = 1499, 
      couponCode,
      metadata = {},
      mode = 'payment',
      productType = 'assessment'
    } = await req.json();

    console.log('Creating checkout session:', {
      resultId,
      userId,
      email,
      priceAmount,
      couponCode,
      mode,
      productType
    });

    // Validate required fields
    if (productType === 'assessment' && !resultId) {
      return new Response(JSON.stringify({ error: 'Quiz result ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!email && productType !== 'credits') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Create a customer if not existing already
    let customerId;
    
    if (userId) {
      // Try to find existing customer by userId
      const { data: existingCustomers } = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
      });

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        console.log('Found existing customer:', customerId);
      }
    }
    
    if (!customerId && email) {
      // Try to find existing customer by email
      const { data: existingCustomers } = await stripe.customers.search({
        query: `email:'${email}'`,
      });

      if (existingCustomers && existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        console.log('Found existing customer by email:', customerId);
      }
    }
    
    // Create a new customer if none exists
    if (!customerId && email) {
      try {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId: userId || 'guest' },
        });
        customerId = customer.id;
        console.log('Created new customer:', customerId);
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        throw error;
      }
    }

    // Prepare line items
    let successUrl = 'https://moralworkbook.com/success?session_id={CHECKOUT_SESSION_ID}';
    
    if (metadata.returnUrl) {
      successUrl = `https://moralworkbook.com${metadata.returnUrl}`;
      if (!successUrl.includes('?')) {
        successUrl += '?session_id={CHECKOUT_SESSION_ID}';
      } else {
        successUrl += '&session_id={CHECKOUT_SESSION_ID}';
      }
    }
    
    // Set appropriate cancel URL
    let cancelUrl = 'https://moralworkbook.com/cancel';
    if (productType === 'assessment' && resultId) {
      cancelUrl = `https://moralworkbook.com/assessment/${resultId}`;
    } else if (productType === 'credits') {
      cancelUrl = 'https://moralworkbook.com/dashboard';
    }
    
    // Prepare product details based on type
    let productDetails = {
      name: 'Detailed Moral Analysis',
      description: 'Full assessment report with personalized insights',
      price: priceAmount, // Default price in cents
    };
    
    if (productType === 'credits') {
      productDetails = {
        name: 'Assessment Credits',
        description: 'Credits for team assessments',
        price: 1999, // $19.99 for credits
      };
    }

    // Check if there's a valid coupon code
    let discountAmount = 0;
    let lineItems = [];
    let discountOptions = undefined;
    
    if (couponCode) {
      try {
        console.log('Looking up coupon:', couponCode);
        
        // Fetch coupon details from Supabase
        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching coupon:', error);
        } else if (coupon) {
          console.log('Found coupon:', coupon);
          
          // Check if coupon has reached max uses
          if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            console.log('Coupon has reached maximum usage limit');
          } 
          // Check if coupon is expired
          else if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            console.log('Coupon has expired');
          }
          // Valid coupon
          else {
            console.log('Applying coupon discount:', coupon.discount_type, coupon.discount_amount);
            
            if (coupon.discount_type === 'percentage') {
              const discountPercentage = coupon.discount_amount;
              discountAmount = Math.round((productDetails.price * discountPercentage) / 100);
              
              // Create a coupon in Stripe for the percentage discount
              const stripeCoupon = await stripe.coupons.create({
                percent_off: discountPercentage,
                duration: 'once',
                metadata: {
                  source: 'moralworkbook',
                  code: coupon.code
                }
              });
              
              discountOptions = {
                coupon: stripeCoupon.id,
              };
              
              console.log('Created Stripe percentage coupon:', stripeCoupon.id);
            } else if (coupon.discount_type === 'fixed') {
              discountAmount = coupon.discount_amount;
              
              // Create a coupon in Stripe for the fixed amount discount
              const stripeCoupon = await stripe.coupons.create({
                amount_off: discountAmount,
                currency: 'usd',
                duration: 'once',
                metadata: {
                  source: 'moralworkbook',
                  code: coupon.code
                }
              });
              
              discountOptions = {
                coupon: stripeCoupon.id,
              };
              
              console.log('Created Stripe fixed amount coupon:', stripeCoupon.id);
            }
          }
        } else {
          console.log('No active coupon found with code:', couponCode);
        }
      } catch (couponError) {
        console.error('Error processing coupon:', couponError);
        // Continue without discount if there's an error
      }
    }
    
    // Create line items based on product type
    lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: productDetails.name,
            description: productDetails.description,
          },
          unit_amount: productDetails.price,
        },
        quantity: 1,
      },
    ];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: mode,
      discounts: discountOptions ? [discountOptions] : [],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: resultId || undefined,
      metadata: {
        ...metadata,
        productType,
        couponCode: couponCode || undefined,
      },
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      customerId,
      discountApplied: !!discountOptions,
      discountAmount
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        discountAmount: discountAmount
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred creating the checkout session',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
