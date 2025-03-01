
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';
import Stripe from 'https://esm.sh/stripe@12.1.1?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2022-11-15',
    });

    const { resultId, email, priceAmount, userId, mode = 'payment', metadata = {} } = await req.json();

    console.log('Checkout request received:', {
      resultId,
      email,
      priceAmount,
      userId,
      mode,
      metadata,
    });

    // Determine what success URL to use
    let successUrl = metadata.returnUrl 
      ? `${req.headers.get('origin')}${metadata.returnUrl}`
      : `${req.headers.get('origin')}/assessment/${resultId}?success=true`;
    
    // Append sessionId parameter to pass through to success page
    successUrl += (successUrl.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}';
    
    const cancelUrl = `${req.headers.get('origin')}/assessment/${resultId}?canceled=true`;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Detailed Moral Hierarchy Assessment',
              description: 'Complete detailed analysis of your moral development level',
              images: [
                `${req.headers.get('origin')}/og-image.png`,
              ],
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        resultId,
        userId,
        isGuest: !userId ? 'true' : 'false',
        email,
        accessToken: metadata.accessToken || null,
        ...metadata,
      },
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      resultId,
      userId: userId || 'guest',
    });

    // If we have a quiz result ID, let's update the database to track this purchase
    if (resultId) {
      try {
        // Check if there's an existing tracking record
        const { data: existingTracking } = await supabaseClient
          .from('purchase_tracking')
          .select('id')
          .eq('quiz_result_id', resultId)
          .maybeSingle();

        if (existingTracking) {
          // Update existing tracking
          await supabaseClient
            .from('purchase_tracking')
            .update({
              stripe_session_id: session.id,
              status: 'pending',
              user_id: userId || null,
              guest_email: !userId ? email : null,
            })
            .eq('id', existingTracking.id);
        } else {
          // Create a new tracking record
          await supabaseClient
            .from('purchase_tracking')
            .insert({
              quiz_result_id: resultId,
              stripe_session_id: session.id,
              user_id: userId || null,
              guest_email: !userId ? email : null,
              status: 'pending',
              metadata: metadata || {},
            });
        }

        // Update the quiz result with the session ID
        await supabaseClient
          .from('quiz_results')
          .update({
            stripe_session_id: session.id,
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending',
            guest_email: !userId ? email : undefined,
          })
          .eq('id', resultId);

        console.log('Database updated with purchase tracking information');
      } catch (dbError) {
        console.error('Error updating database:', dbError);
        // Continue with checkout even if tracking fails
      }
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        status: 'success',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Checkout session error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        status: 'error',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});
