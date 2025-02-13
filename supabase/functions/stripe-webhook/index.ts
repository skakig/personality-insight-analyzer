
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleCreditPurchase } from "./handlers/credit-purchase.ts";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

if (!webhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET. Please set it in your Edge Function secrets.');
}

if (!stripeKey) {
  throw new Error('Missing STRIPE_SECRET_KEY. Please set it in your Edge Function secrets.');
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
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
      throw new Error('No stripe signature in request');
    }

    const rawBody = await req.text();
    console.log('Webhook request details:', {
      method: req.method,
      contentType: req.headers.get('content-type'),
      bodyLength: rawBody.length,
      timestamp: new Date().toISOString(),
    });

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', {
        error: err.message,
        bodyPreview: rawBody.substring(0, 100) + '...',
        signatureUsed: signature,
      });
      throw err;
    }

    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing completed checkout:', session.id);
        
        if (session.metadata?.isGuest === 'true') {
          await handleGuestPurchase(session);
        } else {
          const customer = await stripe.customers.retrieve(session.customer as string);
          const userId = customer.metadata?.supabaseUid;
          
          if (!userId) {
            throw new Error('No supabaseUid found in customer metadata');
          }

          if (session.metadata?.productType === 'credits') {
            await handleCreditPurchase(session, userId);
          } else {
            await handleRegularPurchase(session);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('New subscription created:', subscription.id);
        // Handle new subscription creation
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        // Handle subscription updates (e.g., plan changes, quantity updates)
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);
        // Handle subscription cancellation
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        // Handle successful subscription renewal payments
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        // Handle failed subscription payments
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', {
      message: err.message,
      stack: err.stack,
    });
    
    return new Response(
      JSON.stringify({
        error: {
          message: err.message,
          type: err.constructor.name,
          stack: err.stack,
        }
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
