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
    const { resultId, userId, mode = 'payment', productType, giftRecipientEmail } = await req.json();
    console.log('Request received:', { resultId, userId, mode, productType, giftRecipientEmail });
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User error:', userError);
      throw new Error('User not found');
    }

    if (!user.email) {
      console.error('No email found for user:', user.id);
      throw new Error('User email missing');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    // Check for existing subscription
    const { data: subscription } = await supabaseClient
      .from('corporate_subscriptions')
      .select('*')
      .eq('organization_id', user.id)
      .single();

    // Define price IDs and mode based on the request
    let priceId;
    let checkoutMode = mode;

    if (mode === 'subscription') {
      priceId = 'price_1Qlc65Jy5TVq3Z9Hq6w7xhSm'; // Pro subscription
    } else {
      checkoutMode = 'payment'; // Force payment mode for one-time purchases
      if (productType === 'credits') {
        priceId = 'price_1QlcfyJy5TVq3Z9HzMjHJ1YB';
      } else {
        priceId = 'price_1QloJQJy5TVq3Z9HTnIN6BX5'; // Single assessment
      }
    }

    console.log('Using mode:', checkoutMode, 'and priceId:', priceId);

    let customer_id;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      
      if (mode === 'subscription') {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer_id,
          status: 'active',
          price: priceId,
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          throw new Error("Customer already has an active subscription");
        }
      }
    }

    // Base metadata
    const metadata: Record<string, string> = {
      userId: user.id,
    };

    if (resultId) {
      metadata.resultId = resultId;
      metadata.accessMethod = mode === 'subscription' ? 'subscription_credit' : 'purchase';
    }

    if (giftRecipientEmail) {
      metadata.giftRecipientEmail = giftRecipientEmail;
      metadata.isGift = 'true';
    }

    if (productType) {
      metadata.productType = productType;
    }

    // Get the personality type for the success URL
    const { data: quizResult } = await supabaseClient
      .from('quiz_results')
      .select('personality_type')
      .eq('id', resultId)
      .single();

    const level = quizResult?.personality_type || '1';
    const baseUrl = req.headers.get('origin') || '';
    
    // Construct success URL based on whether it's a gift or not
    const successUrl = giftRecipientEmail 
      ? `${baseUrl}/gift-success?level=${level}`
      : `${baseUrl}/assessment/${resultId}?success=true`;

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      customer_email: customer_id ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
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