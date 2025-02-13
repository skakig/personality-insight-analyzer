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
  httpClient: Stripe.createFetchHttpClient(), // Ensure we're using fetch
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature in request');
    }

    // Get the raw body and log its details
    const rawBody = await req.text();
    console.log('Webhook request details:', {
      method: req.method,
      contentType: req.headers.get('content-type'),
      bodyLength: rawBody.length,
      signatureHeader: signature.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });

    // Verify the webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider() // Explicitly use SubtleCrypto
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', {
        error: err.message,
        bodyPreview: rawBody.substring(0, 100) + '...',
        signatureUsed: signature,
      });
      throw err;
    }

    // Log successful verification
    console.log('✅ Webhook signature verified successfully:', {
      eventId: event.id,
      eventType: event.type,
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout session:', {
          sessionId: session.id,
          metadata: session.metadata,
        });

        // Handle based on metadata
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
      // Add other event types as needed
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

// Helper functions
async function handleGuestPurchase(session: Stripe.Checkout.Session) {
  const resultId = session.metadata?.resultId;

  if (!resultId) {
    throw new Error('No resultId found in session metadata');
  }

  console.log('Guest purchase details:', {
    sessionId: session.id,
    resultId: resultId,
  });

  // Placeholder: Logic to handle guest purchase, e.g., store resultId against the email
  console.log('Simulating storing resultId against email for guest purchase');
}

async function handleCreditPurchase(session: Stripe.Checkout.Session, userId: string) {
  const amount = session.metadata?.amount;

  if (!userId) {
    throw new Error('No userId provided');
  }

  if (!amount) {
    throw new Error('No amount provided');
  }

  console.log('Credit purchase details:', {
    sessionId: session.id,
    userId: userId,
    amount: amount,
  });

  // Placeholder: Logic to handle credit purchase, e.g., update user credits in database
  console.log('Simulating updating user credits in database');
}

async function handleRegularPurchase(session: Stripe.Checkout.Session) {
  const resultId = session.metadata?.resultId;

  if (!resultId) {
    throw new Error('No resultId found in session metadata');
  }

  console.log('Regular purchase details:', {
    sessionId: session.id,
    resultId: resultId,
  });

  // Placeholder: Logic to handle regular purchase, e.g., mark result as purchased in database
  console.log('Simulating marking result as purchased in database');
}
