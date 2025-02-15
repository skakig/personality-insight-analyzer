
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('Received request body:', await req.text());
    
    // Parse the request body after logging it
    const { priceId, mode = 'subscription', email = null } = await req.json();
    
    console.log('Parsed request parameters:', { priceId, mode, email });

    // Validate required parameters
    if (!priceId) {
      console.error('Missing required priceId parameter');
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Initializing Stripe with API key status:', !!Deno.env.get('STRIPE_SECRET_KEY'));

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a guest purchase record
    let guestPurchaseId;
    try {
      const { data: guestPurchase, error: insertError } = await supabaseAdmin
        .from('guest_purchases')
        .insert({
          purchase_type: mode,
          price_id: priceId,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating guest purchase:', insertError);
        throw new Error('Failed to create guest purchase record');
      }

      guestPurchaseId = guestPurchase.id;
      console.log('Created guest purchase record:', guestPurchaseId);
    } catch (error) {
      console.error('Error in guest purchase creation:', error);
      throw error;
    }

    // Create Stripe checkout session
    try {
      console.log('Creating Stripe checkout session with params:', {
        priceId,
        mode,
        guestPurchaseId
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode as 'payment' | 'subscription',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
        ...(email && { customer_email: email }),
        metadata: {
          guestPurchaseId,
          isGuest: 'true',
        },
      });

      console.log('Successfully created Stripe session:', session.id);

      // Update guest purchase with Stripe session ID
      await supabaseAdmin
        .from('guest_purchases')
        .update({ stripe_session_id: session.id })
        .eq('id', guestPurchaseId);

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error('Stripe session creation error:', stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
