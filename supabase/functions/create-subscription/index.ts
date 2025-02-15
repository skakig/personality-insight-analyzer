
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, mode = 'subscription', metadata = {}, email } = await req.json();

    // Extract authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      // Get user ID from auth header if it exists
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!error && user) {
        userId = user.id;
      }
    }

    // Validate required parameters
    if (!priceId) {
      console.error('Missing priceId parameter');
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing subscription request:', { priceId, mode, metadata, userId });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create customer if email is provided (guest checkout)
    let customer;
    if (email && !userId) {
      const customers = await stripe.customers.list({ email });
      customer = customers.data[0] || await stripe.customers.create({ email });
      
      // Store guest subscription info
      const { error: guestError } = await supabase
        .from('guest_subscriptions')
        .insert({
          email,
          stripe_customer_id: customer.id,
          stripe_price_id: priceId,
          plan_type: mode === 'subscription' ? 'pro' : 'individual',
          status: 'pending'
        });

      if (guestError) {
        console.error('Error storing guest subscription:', guestError);
      }
    }

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
        userId,
        isGuest: !userId,
        ...metadata
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Add customer ID if available
    if (customer?.id) {
      Object.assign(sessionConfig, { customer: customer.id });
    }

    // Add payment_method_types for subscriptions
    if (mode === 'subscription') {
      Object.assign(sessionConfig, {
        payment_method_types: ['card']
      });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update guest subscription with session ID if applicable
    if (email && !userId) {
      await supabase
        .from('guest_subscriptions')
        .update({ session_id: session.id })
        .eq('email', email);
    }

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
