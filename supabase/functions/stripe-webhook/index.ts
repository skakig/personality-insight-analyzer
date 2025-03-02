
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

// Webhook secret for validating webhook events
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || '';

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // Get the raw request body
  const body = await req.text();
  let event;

  try {
    // Verify the event with the webhook secret
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
  }

  // Create a Supabase client for DB operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Store the complete webhook event for debugging
  try {
    await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        raw_event: event,
        status: 'received',
      });
  } catch (dbError) {
    console.error('Failed to log webhook event to database:', dbError);
    // Continue processing the event even if logging fails
  }

  console.log(`Received event ${event.id} of type ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // Payment is successful, update the result in the database
        const session = event.data.object;
        const { resultId, userId } = session.metadata;
        
        if (!resultId) {
          throw new Error('Missing resultId in session metadata');
        }
        
        console.log(`Processing completed checkout for result: ${resultId}, session: ${session.id}`);
        
        // Update the quiz result
        const { error: resultError } = await supabaseClient
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase'
          })
          .eq('id', resultId);
          
        if (resultError) {
          console.error('Error updating quiz result:', resultError);
        }
        
        // Update purchase tracking
        const { error: trackingError } = await supabaseClient
          .from('purchase_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('quiz_result_id', resultId)
          .eq('stripe_session_id', session.id);
          
        if (trackingError) {
          console.error('Error updating purchase tracking:', trackingError);
        }
        
        // Mark webhook event as processed
        await supabaseClient
          .from('stripe_webhook_events')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('stripe_event_id', event.id);
        
        break;
      }
      
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing Stripe webhook: ${error.message}`);
    
    // Log the error to the database
    await supabaseClient
      .from('stripe_webhook_events')
      .update({
        status: 'error',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);
      
    return new Response(`Error processing webhook: ${error.message}`, { status: 500 });
  }

  // Return a 200 response to Stripe to acknowledge receipt of the event
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
