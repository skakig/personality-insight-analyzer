
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleCreditPurchase } from "./handlers/credit-purchase.ts";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

console.log('Environment check:', {
  hasWebhookSecret: !!webhookSecret,
  hasStripeKey: !!stripeKey,
  webhookSecretPrefix: webhookSecret?.substring(0, 6),
  stripeKeyPrefix: stripeKey?.substring(0, 6)
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
    console.log('Webhook received:', {
      method: req.method,
      url: req.url,
      hasSignature: !!req.headers.get('stripe-signature')
    });

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found in headers:', Object.fromEntries(req.headers.entries()));
      throw new Error('No Stripe signature found');
    }

    if (!webhookSecret) {
      console.error('Webhook secret not configured in environment');
      throw new Error('Webhook secret not configured');
    }

    const body = await req.text();
    console.log('Webhook payload size:', body.length, 'bytes');

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      console.log('Signature details:', {
        signatureHeader: signature,
        bodyPreview: body.substring(0, 50)
      });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Successfully constructed event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed session:', {
        sessionId: session.id,
        metadata: session.metadata,
        customerId: session.customer
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
          sessionId: session.id
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
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name,
        details: error.stack 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
