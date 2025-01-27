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
    const { resultId, userId, mode = 'payment', productType } = await req.json();
    console.log('Request received:', { resultId, userId, mode, productType });
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User error:', userError);
      throw new Error('User not found');
    }

    if (!user.email) {
      console.error('No email found for user:', user.id);
      throw new Error('User email missing');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customer_id;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
    }

    // Get user's subscription status
    const { data: subscription } = await supabaseClient
      .from('corporate_subscriptions')
      .select('*')
      .eq('organization_id', user.id)
      .single();

    // Use the correct price ID based on the product type
    let priceId = 'price_1QloJQJy5TVq3Z9HTnIN6BX5'; // Default price ID for report unlock

    if (productType === 'credits') {
      priceId = 'price_1QlcfyJy5TVq3Z9HzMjHJ1YB'; // Credits price ID
    } else if (subscription?.active) {
      priceId = 'price_1Qlc65Jy5TVq3Z9Hq6w7xhSm'; // Pro subscription price
    }

    console.log('Creating checkout session with mode:', mode, 'and priceId:', priceId);
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?success=false`,
      metadata: resultId ? {
        resultId,
        userId: user.id,
        accessMethod: mode === 'subscription' ? 'subscription_credit' : 'purchase'
      } : {
        userId: user.id,
        productType
      },
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