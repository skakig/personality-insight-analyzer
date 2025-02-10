
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { resultId, userId, mode = 'payment', giftRecipientEmail, email } = await req.json();
    console.log('Request received:', { resultId, userId, mode, giftRecipientEmail, email });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const baseUrl = req.headers.get('origin') || '';
    
    // Create metadata object
    const metadata: Record<string, string> = {};
    
    if (userId) {
      metadata.userId = userId;
    }
    
    if (resultId) {
      metadata.resultId = resultId;
      metadata.accessMethod = mode === 'subscription' ? 'subscription_credit' : 'purchase';
    }
    
    if (giftRecipientEmail) {
      metadata.giftRecipientEmail = giftRecipientEmail;
      metadata.isGift = 'true';
    }

    if (email) {
      metadata.isGuest = 'true';
      metadata.email = email;
    }

    const successUrl = resultId 
      ? `${baseUrl}/assessment/${resultId}?success=true`
      : `${baseUrl}/dashboard?success=true`;

    // If this is a guest purchase, create a record in guest_purchases
    if (email) {
      const { error: insertError } = await supabaseClient
        .from('guest_purchases')
        .insert({
          email,
          purchase_type: 'assessment',
          result_id: resultId,
          metadata
        });

      if (insertError) throw insertError;
    }

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
      customer_email: email, // Add customer email for guest purchases
    });

    if (email) {
      // Update guest_purchase with stripe session id
      const { error: updateError } = await supabaseClient
        .from('guest_purchases')
        .update({ stripe_session_id: session.id })
        .eq('email', email);

      if (updateError) throw updateError;
    }

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
