import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { resultId, userId, mode = 'subscription' } = await req.json();
    
    if (!resultId || !userId) {
      throw new Error('Missing required parameters: resultId and userId are required');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating checkout session with params:', {
      resultId,
      userId,
      mode,
      origin: req.headers.get('origin')
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Qlc4VJy5TVq3Z9H0PFhn9hs',
          quantity: 1,
        },
      ],
      mode: 'subscription', // Always use subscription mode for recurring prices
      success_url: `${req.headers.get('origin')}/assessment-history?success=true&resultId=${resultId}`,
      cancel_url: `${req.headers.get('origin')}/assessment-history?canceled=true`,
      metadata: {
        resultId: resultId,
        userId: userId
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});