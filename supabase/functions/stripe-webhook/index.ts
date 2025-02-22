
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { handleGuestPurchase } from "./handlers/guest-purchase.ts";
import { handleRegularPurchase } from "./handlers/regular-purchase.ts";

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!webhookSecret || !stripeKey || !supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function logWebhookEvent(event: any, status = 'pending', errorMessage?: string) {
  try {
    console.log('Logging webhook event:', {
      id: event.id,
      type: event.type,
      status,
      timestamp: new Date().toISOString()
    });

    const { error } = await supabase
      .from('stripe_webhook_events')
      .upsert({
        stripe_event_id: event.id,
        event_type: event.type,
        status,
        raw_event: event,
        error_message: errorMessage,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      }, {
        onConflict: 'stripe_event_id'
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    }
  } catch (err) {
    console.error('Failed to log webhook event:', err);
  }
}

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
    console.log('Received webhook:', {
      contentLength: rawBody.length,
      signature: signature.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', {
        error: err.message,
        bodyPreview: rawBody.substring(0, 100) + '...',
        signatureUsed: signature,
      });
      throw err;
    }

    // Log the event immediately
    await logWebhookEvent(event);

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Determine if this is a guest purchase
        const isGuestPurchase = !session.customer && session.metadata?.email;

        if (isGuestPurchase) {
          await handleGuestPurchase(supabase, event);
        } else {
          await handleRegularPurchase(supabase, event);
        }
      }

      // Mark event as completed
      await logWebhookEvent(event, 'completed');

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (processingError) {
      console.error('Failed to process webhook:', {
        error: processingError,
        eventId: event.id,
        eventType: event.type,
        timestamp: new Date().toISOString()
      });

      // Log the processing error
      await logWebhookEvent(event, 'failed', processingError.message);
      throw processingError;
    }
  } catch (err) {
    console.error('Webhook error:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
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
