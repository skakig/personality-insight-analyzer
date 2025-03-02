
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

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
    let finalPrice = requestData.priceAmount || 1499 // Default to $14.99 if no amount provided
    
    // Apply coupon if provided
    if (couponCode) {
      try {
        // Fetch coupon details from the database
        const { data: couponData, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .eq('is_active', true)
          .lt('current_uses', 'max_uses')
          .single()
        
        if (couponError || !couponData) {
          console.error('Coupon not found or invalid:', couponError)
        } else {
          // Calculate discount
          if (couponData.discount_type === 'percentage') {
            discountAmount = Math.round(finalPrice * (couponData.discount_amount / 100))
          } else {
            discountAmount = couponData.discount_amount
          }
          
          finalPrice = Math.max(0, finalPrice - discountAmount)
          console.log(`Applied coupon ${couponCode}: ${discountAmount} discount, final price: ${finalPrice}`)
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
              name: requestData.productType === 'credits' 
                ? 'Assessment Credits' 
                : 'Moral Hierarchy Detailed Report',
              description: requestData.productType === 'credits'
                ? 'Credits for taking personality assessments'
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
