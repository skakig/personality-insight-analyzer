
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, mode = 'subscription', metadata = {} } = await req.json();

    // Validate required parameters
    if (!priceId) {
      console.error('Missing priceId parameter');
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing subscription request:', { priceId, mode, metadata });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create a basic checkout session configuration
    const sessionConfig = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        isGuest: 'true',
        ...metadata
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Add payment_method_types for subscriptions
    if (mode === 'subscription') {
      Object.assign(sessionConfig, {
        payment_method_types: ['card'],
        subscription_data: {
          trial_period_days: 14 // Optional: Add a trial period
        }
      });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Created Stripe session:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
