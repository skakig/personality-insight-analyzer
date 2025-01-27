import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    const { headers } = req;
    const authorization = headers.get('Authorization');

    if (!authorization) {
      throw new Error('No authorization header');
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid credentials');
    }

    const { resultId, mode = 'payment', productType } = await req.json();
    console.log('Request payload:', { resultId, mode, productType });

    // Get or create customer
    let customerId;
    const { data: customers } = await stripe.customers.search({
      query: `metadata['supabaseUid']:'${user.id}'`,
    });

    if (customers && customers.length > 0) {
      customerId = customers[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUid: user.id,
        },
      });
      customerId = customer.id;
    }

    // Determine the correct price ID based on the purchase type
    let priceId;
    if (productType === 'credits') {
      priceId = 'price_1QlcfyJy5TVq3Z9HzMjHJ1YB'; // Credits purchase
    } else if (mode === 'subscription') {
      priceId = 'price_1Qlc65Jy5TVq3Z9Hq6w7xhSm'; // Pro subscription
    } else {
      priceId = 'price_1QlcKLJy5TVq3Z9HXYgYvN2x'; // Single report ($9.99)
    }

    console.log('Creating checkout session with mode:', mode, 'and priceId:', priceId);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard`,
      metadata: {
        userId: user.id,
        resultId: resultId || '',
        accessMethod: mode === 'subscription' ? 'subscription' : 'purchase',
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    );
  }
});