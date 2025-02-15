
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resultId, email, priceAmount, metadata } = await req.json();

    // If this is a guest purchase, create a record
    if (email && !metadata.userId) {
      const { data: guestPurchase, error: insertError } = await supabaseAdmin
        .from('guest_purchases')
        .insert({
          email,
          result_id: resultId,
          purchase_type: 'assessment',
          metadata: {
            ...metadata,
            resultId,
            email
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating guest purchase:', insertError);
        throw new Error('Failed to create guest purchase record');
      }

      // Update metadata with guest purchase ID
      metadata.guestPurchaseId = guestPurchase.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full Assessment Report',
              description: 'Unlock your detailed personality assessment report',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/assessment/${resultId}?success=true`,
      cancel_url: `${req.headers.get('origin')}/assessment/${resultId}?canceled=true`,
      customer_email: email || undefined,
      metadata: {
        resultId,
        ...metadata,
      },
    });

    // Update guest purchase with Stripe session ID if applicable
    if (metadata.guestPurchaseId) {
      await supabaseAdmin
        .from('guest_purchases')
        .update({ stripe_session_id: session.id })
        .eq('id', metadata.guestPurchaseId);
    }

    // Also update the quiz result to track the pending purchase
    await supabaseAdmin
      .from('quiz_results')
      .update({ 
        stripe_session_id: session.id,
        access_method: 'purchase'
      })
      .eq('id', resultId);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
