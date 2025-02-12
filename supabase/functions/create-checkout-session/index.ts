
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { userId, resultId, accessMethod } = await req.json();
    console.log('Creating checkout session:', { userId, resultId, accessMethod });

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if user has an active subscription with available reports
    const { data: subscription } = await supabaseAdmin
      .from('corporate_subscriptions')
      .select('*')
      .eq('organization_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (subscription && subscription.assessments_used < subscription.max_assessments) {
      // Update the quiz result to mark it as detailed/purchased
      const { error: updateError } = await supabaseAdmin
        .from('quiz_results')
        .update({
          is_detailed: true,
          is_purchased: true,
          access_method: 'subscription'
        })
        .eq('id', resultId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          url: `/assessment/${resultId}`,
          method: 'direct'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const baseUrl = req.headers.get('origin') || '';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full Assessment Report',
              description: 'Unlock your detailed personality assessment report',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/assessment/${resultId}?success=true`,
      cancel_url: `${baseUrl}/dashboard?success=false`,
      metadata: {
        userId,
        resultId,
        accessMethod,
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
