
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleCreditPurchase } from "./handlers/credit-purchase.ts";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    console.log('Webhook received:', req.method);

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found');
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    console.log('Webhook body received:', body.substring(0, 100) + '...'); // Log first 100 chars for safety

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }

    console.log('Constructing Stripe event...');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      console.log('Session metadata:', session.metadata);

      if (session.metadata?.isGuest === 'true') {
        console.log('Processing guest purchase...');
        await handleGuestPurchase(session);
      } else {
        const customerId = session.customer;
        console.log('Retrieving customer:', customerId);
        const customer = await stripe.customers.retrieve(customerId as string);
        const userId = customer.metadata.supabaseUid;
        const productType = session.metadata?.productType;

        console.log('Processing purchase for user:', userId);
        console.log('Product type:', productType);

        if (productType === 'credits') {
          await handleCreditPurchase(session, userId);
        } else {
          await handleRegularPurchase(session);
        }
      }

      console.log('Purchase processing completed successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    console.error('Full error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
