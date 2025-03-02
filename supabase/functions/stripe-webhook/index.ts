
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";
import handleRegularPurchase from "./handlers/regular-purchase.ts";
import handleGuestPurchase from "./handlers/guest-purchase.ts";
import handleSubscriptionCompleted from "./handlers/subscription-completed.ts";
import handleCreditPurchase from "./handlers/credit-purchase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get the raw body from the request
    const body = await req.text();
    
    let event;
    
    try {
      // Verify the event with Stripe
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing completed checkout session:', session.id);
        
        // Process background tasks with proper error handling
        const processingPromise = (async () => {
          try {
            // Check if the purchase is for credits
            if (session.metadata?.type === 'credits') {
              await handleCreditPurchase(session);
              return;
            }
            
            // Check if the purchase is for a subscription
            if (session.mode === 'subscription') {
              await handleSubscriptionCompleted(session);
              return;
            }
            
            // Determine if it's a regular or guest purchase
            if (session.metadata?.userId && session.metadata.userId !== 'guest') {
              await handleRegularPurchase(session, session.metadata.userId);
            } else {
              await handleGuestPurchase(session);
            }
          } catch (error) {
            console.error('Error processing webhook event:', error);
          }
        })();
        
        // Use EdgeRuntime.waitUntil to properly handle the background task
        if (typeof EdgeRuntime !== 'undefined' && 'waitUntil' in EdgeRuntime) {
          EdgeRuntime.waitUntil(processingPromise);
        } else {
          // For older Deno runtime versions that don't support EdgeRuntime.waitUntil
          await processingPromise;
        }
        
        break;
      }
      
      // Handle other event types if needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
