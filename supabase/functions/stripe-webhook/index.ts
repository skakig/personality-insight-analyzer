
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleCreditPurchase } from "./handlers/credit-purchase.ts";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

console.log('Edge function started. Environment check:', {
  hasWebhookSecret: !!webhookSecret,
  hasStripeKey: !!stripeKey,
  webhookSecretPrefix: webhookSecret?.substring(0, 6),
  stripeKeyPrefix: stripeKey?.substring(0, 6),
  timestamp: new Date().toISOString()
});

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('No Stripe signature found in request headers');
      throw new Error('No Stripe signature found');
    }

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }

    // Get the raw body as text
    const rawBody = await req.text();
    console.log('Received webhook payload:', {
      size: rawBody.length,
      signature: signature,
      timestamp: new Date().toISOString()
    });

    let event: Stripe.Event;
    
    try {
      // Use constructEventAsync instead of constructEvent
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
      console.log('Webhook signature verified successfully');
    } catch (err) {
      console.error('Webhook signature verification failed:', {
        error: err.message,
        signature: signature,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', {
        sessionId: session.id,
        metadata: session.metadata,
        timestamp: new Date().toISOString()
      });

      if (session.metadata?.isGuest === 'true') {
        console.log('Processing guest purchase');
        await handleGuestPurchase(session);
      } else {
        const customerId = session.customer;
        console.log('Retrieving customer:', customerId);
        const customer = await stripe.customers.retrieve(customerId as string);
        const userId = customer.metadata.supabaseUid;
        const productType = session.metadata?.productType;

        console.log('Processing purchase for user:', {
          userId,
          productType,
          sessionId: session.id,
          timestamp: new Date().toISOString()
        });

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
    console.error('Webhook error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        error: error.message,
        type: error.name,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
