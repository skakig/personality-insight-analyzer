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
    const { resultId, userId, mode } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Processing checkout request for:', { userId, mode, resultId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !user?.email) {
      console.error('User error:', userError);
      throw new Error('User not found or email missing');
    }

    console.log('Found user:', { email: user.email });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      if (mode === 'subscription') {
        // Check for existing subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          // Create a billing portal session instead
          console.log('Creating billing portal session for existing customer');
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.get('origin')}/dashboard`,
          });

          return new Response(
            JSON.stringify({ url: portalSession.url }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }
    } else {
      console.log('Creating new customer for:', user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUid: userId,
        },
      });
      customerId = customer.id;
    }

    console.log('Creating checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: mode === 'subscription' ? 'price_1Qlc65Jy5TVq3Z9Hq6w7xhSm' : 'price_1Qlc4VJy5TVq3Z9H0PFhn9hs',
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?success=false`,
      metadata: resultId ? {
        resultId,
        userId,
      } : undefined,
    });

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});