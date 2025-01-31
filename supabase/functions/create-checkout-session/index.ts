import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultId, userId, mode = 'payment', giftRecipientEmail } = await req.json();
    console.log('Request received:', { resultId, userId, mode, giftRecipientEmail });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Base metadata
    const metadata: Record<string, string> = {
      userId: userId,
    };

    if (resultId) {
      metadata.resultId = resultId;
      metadata.accessMethod = mode === 'subscription' ? 'subscription_credit' : 'purchase';
    }

    if (giftRecipientEmail) {
      metadata.giftRecipientEmail = giftRecipientEmail;
      metadata.isGift = 'true';
    }

    const baseUrl = req.headers.get('origin') || '';
    const successUrl = resultId 
      ? `${baseUrl}/assessment/${resultId}?success=true`
      : `${baseUrl}/dashboard?success=true`;

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1QloJQJy5TVq3Z9HTnIN6BX5', // Single assessment price
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${baseUrl}/assessment/${resultId}?success=false`,
      metadata,
    });

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});