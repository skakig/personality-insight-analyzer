
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleCreditPurchase } from "./handlers/credit-purchase.ts";
import { handleSubscriptionCompleted } from "./handlers/subscription-completed.ts";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// Define CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Stripe webhook received request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature found in request headers");
      return new Response(JSON.stringify({ error: "No Stripe signature found" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Read the request body as text
    const body = await req.text();
    if (!body) {
      console.error("Empty request body");
      return new Response(JSON.stringify({ error: "Empty request body" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log request information (not including full body for security)
    console.log(`Webhook received with signature: ${signature.substring(0, 15)}...`);
    
    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Webhook secret not set in environment variables");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Webhook verified: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract the data object
    const data = event.data.object;
    console.log(`Processing event type: ${event.type}`);
    
    // Handle different event types
    let response;
    if (event.type === 'checkout.session.completed') {
      // Get metadata to determine the type of purchase
      const metadata = data.metadata || {};
      
      if (metadata.isGift === 'true') {
        console.log('Processing gift purchase');
        // Handle gift purchase
        // Implementation not shown here
      } else if (metadata.isGuest === 'true') {
        console.log('Processing guest purchase');
        response = await handleGuestPurchase(data);
      } else if (metadata.productType === 'credits') {
        console.log('Processing credit purchase');
        response = await handleCreditPurchase(data);
      } else {
        console.log('Processing regular purchase');
        response = await handleRegularPurchase(data);
      }
    } else if (event.type === 'invoice.paid') {
      console.log('Processing subscription payment');
      response = await handleSubscriptionCompleted(data);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return a 200 response to acknowledge receipt of the webhook
    return new Response(JSON.stringify({ received: true, success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log the detailed error but don't expose it in the response
    console.error(`Webhook error: ${error.message}`);
    console.error(error.stack);
    
    // Still return a 200 status to acknowledge receipt (Stripe recommendation)
    // This prevents Stripe from retrying again and again
    return new Response(JSON.stringify({ received: true, success: false, message: "Processed with errors" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
