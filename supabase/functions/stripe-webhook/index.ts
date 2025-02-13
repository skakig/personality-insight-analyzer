
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

async function logWebhookEvent(stripeEvent: any, status = 'pending', errorMessage?: string) {
  try {
    const { error } = await supabase
      .from('stripe_webhook_events')
      .upsert({
        stripe_event_id: stripeEvent.id,
        event_type: stripeEvent.type,
        status,
        raw_event: stripeEvent,
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

async function updateQuizResult(resultId: string, sessionId: string) {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        stripe_session_id: sessionId,
        access_method: 'purchase'
      })
      .eq('id', resultId);

    if (error) {
      throw error;
    }

    console.log('Successfully updated quiz result:', { resultId, sessionId });
  } catch (err) {
    console.error('Failed to update quiz result:', err);
    throw err;
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

    // Get the raw body as text
    const rawBody = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
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

    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString()
    });

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get resultId directly from session metadata
        const resultId = session.metadata?.resultId;
        if (!resultId) {
          throw new Error('No resultId found in session metadata');
        }

        // Update the quiz result with purchase information
        await updateQuizResult(resultId, session.id);
        
        // Mark webhook event as completed
        await logWebhookEvent(event, 'completed');
        
        console.log('Successfully processed checkout session:', {
          sessionId: session.id,
          resultId,
          timestamp: new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (processingError) {
      // Log the processing error
      await logWebhookEvent(event, 'failed', processingError.message);
      throw processingError;
    }
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
