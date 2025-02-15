
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, mode = 'subscription', email = null } = await req.json();
    if (!priceId) {
      throw new Error('Price ID is required');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a guest purchase record if no authenticated user
    let guestPurchaseId;
    if (!email) {
      const { data: guestPurchase, error: insertError } = await supabaseAdmin
        .from('guest_purchases')
        .insert({
          purchase_type: 'subscription',
          price_id: priceId,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating guest purchase:', insertError);
        throw new Error('Failed to create guest purchase record');
      }

      guestPurchaseId = guestPurchase.id;
    }

    // Create Stripe checkout session
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
        ...(guestPurchaseId && { guestPurchaseId, isGuest: 'true' }),
      },
    });

    // Update guest purchase with Stripe session ID if applicable
    if (guestPurchaseId) {
      await supabaseAdmin
        .from('guest_purchases')
        .update({ stripe_session_id: session.id })
        .eq('id', guestPurchaseId);
    }

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
        status: 400,
      }
    );
  }
});
