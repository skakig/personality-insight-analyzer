
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
    // Log everything about the incoming request
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString()
    };
    
    console.log('Incoming webhook request:', JSON.stringify(requestInfo, null, 2));

    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found in headers. All headers:', requestInfo.headers);
      throw new Error('No Stripe signature found');
    }

    if (!webhookSecret) {
      console.error('Webhook secret not configured in environment');
      throw new Error('Webhook secret not configured');
    }

    const body = await req.text();
    console.log('Raw webhook payload:', {
      size: body.length,
      preview: body.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    let event: Stripe.Event;
    
    try {
      console.log('Attempting to verify webhook signature...');
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log('Signature verification successful');
    } catch (err) {
      console.error('Error verifying webhook signature:', {
        error: err.message,
        stack: err.stack,
        signature: signature,
        bodyPreview: body.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Successfully constructed event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed session:', {
        sessionId: session.id,
        metadata: session.metadata,
        customerId: session.customer,
        timestamp: new Date().toISOString()
      });

      if (session.metadata?.isGuest === 'true') {
        console.log('Processing guest purchase...');
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
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
