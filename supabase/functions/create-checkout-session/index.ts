
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'https://esm.sh/stripe@12.5.0?target=deno'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed. Use POST.'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Parse request body
    const requestData = await req.json()
    console.log('Request data:', requestData)

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Default values
    const mode = requestData.mode || 'payment'
    const successUrl = `${Deno.env.get('SITE_URL')}/assessment/${requestData.resultId || ''}?success=true`
    const cancelUrl = `${Deno.env.get('SITE_URL')}/assessment/${requestData.resultId || ''}`
    
    // Check for coupon code
    let couponCode = requestData.couponCode
    let discountAmount = 0
    let finalPrice = requestData.priceAmount || requestData.basePrice || 1499 // Default to $14.99 if no amount provided
    
    // Apply coupon if provided
    if (couponCode) {
      try {
        // Fetch coupon details from the database
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .eq('is_active', true)
          .single()
        
        if (couponError || !couponData) {
          console.error('Coupon not found or invalid:', couponError)
        } else {
          // Check if coupon has reached max uses
          if (couponData.max_uses && couponData.current_uses >= couponData.max_uses) {
            console.log('Coupon has reached max uses:', {
              max: couponData.max_uses,
              current: couponData.current_uses
            })
          } 
          // Check if coupon is expired
          else if (couponData.expires_at && new Date(couponData.expires_at) < new Date()) {
            console.log('Coupon has expired:', couponData.expires_at)
          }
          else {
            // Calculate discount
            if (couponData.discount_type === 'percentage') {
              discountAmount = Math.round(finalPrice * (couponData.discount_amount / 100))
            } else {
              discountAmount = couponData.discount_amount
            }
            
            finalPrice = Math.max(0, finalPrice - discountAmount)
            console.log(`Applied coupon ${couponCode}: ${discountAmount} discount, final price: ${finalPrice}`)
            
            // Increment coupon usage
            try {
              await supabase
                .from('coupons')
                .update({ current_uses: (couponData.current_uses || 0) + 1 })
                .eq('id', couponData.id)
              console.log('Incremented coupon usage count')
            } catch (err) {
              console.error('Failed to increment coupon usage:', err)
            }
          }
        }
      } catch (couponErr) {
        console.error('Error applying coupon:', couponErr)
        // Continue without the coupon if there's an error
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
              name: requestData.productType === 'book' 
                ? 'The Moral Hierarchy: Pre-Order'
                : 'Moral Hierarchy Detailed Report',
              description: requestData.productType === 'book'
                ? 'Pre-order of The Moral Hierarchy book'
                : 'Personalized detailed analysis of your moral hierarchy level',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: requestData.metadata?.returnUrl || successUrl,
      cancel_url: cancelUrl,
      customer_email: requestData.email || undefined,
      metadata: {
        resultId: requestData.resultId,
        userId: requestData.userId,
        guestEmail: !requestData.userId ? requestData.email : undefined,
        accessToken: requestData.metadata?.accessToken,
        couponCode: couponCode,
        discountAmount: discountAmount,
        productType: requestData.productType || 'report',
        ...requestData.metadata,
      },
    })

    // Return session info
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        discountAmount
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
