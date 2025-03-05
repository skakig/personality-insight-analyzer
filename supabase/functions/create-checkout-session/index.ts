
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { resultId, email, userId, priceAmount, metadata = {}, returnUrl } = await req.json();

    if (!resultId) {
      throw new Error('Missing result ID');
    }

    console.log('Creating checkout session for:', {
      resultId,
      email: email || 'not provided',
      userId: userId || 'guest',
      amount: priceAmount,
      hasMetadata: !!metadata,
    });

    // Enhanced metadata with all important identifiers
    const enhancedMetadata = {
      resultId,
      userId: userId || 'guest',
      ...metadata,
    };

    if (email) {
      enhancedMetadata.email = email;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: returnUrl || `${req.headers.get('origin')}/assessment/${resultId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl?.replace('success=true', 'success=false') || `${req.headers.get('origin')}/assessment/${resultId}?success=false`,
      metadata: enhancedMetadata,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Detailed Moral Hierarchy Report',
              description: 'Full personality assessment with detailed insights',
            },
            unit_amount: priceAmount || 1499,
          },
          quantity: 1,
        },
      ],
    });

    // Return the session information
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
});
