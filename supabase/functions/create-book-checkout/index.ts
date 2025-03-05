
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { successUrl, cancelUrl } = body;
    
    console.log('Creating book checkout session with params:', {
      successUrl: successUrl || 'Default success URL',
      cancelUrl: cancelUrl || 'Default cancel URL'
    });
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Moral Hierarchy Book Pre-Order',
              description: 'Pre-order for the upcoming book: The Moral Hierarchy',
              images: ['https://example.com/placeholder-book-cover.jpg'], // Replace with your book cover image
            },
            unit_amount: 2499, // $24.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/book?canceled=true`,
    });

    console.log('Checkout session created successfully:', {
      id: session.id,
      url: session.url,
      status: session.status
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
