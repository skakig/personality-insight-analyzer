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

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);

      const customerId = session.customer;
      const customer = await stripe.customers.retrieve(customerId as string);
      const userId = customer.metadata.supabaseUid;
      const accessMethod = session.metadata?.accessMethod;

      if (session.mode === 'payment' && session.metadata?.resultId) {
        // Check if user has an active subscription
        const { data: subscription, error: subscriptionError } = await supabaseAdmin
          .from('corporate_subscriptions')
          .select('*')
          .eq('organization_id', userId)
          .eq('active', true)
          .single();

        if (subscriptionError) {
          console.error('Error checking subscription:', subscriptionError);
          throw subscriptionError;
        }

        if (subscription) {
          // Check if user has available assessments
          if (subscription.assessments_used >= subscription.max_assessments) {
            console.error('User has exceeded assessment limit');
            throw new Error('Assessment limit exceeded');
          }

          // Increment the assessments_used count
          const { error: updateError } = await supabaseAdmin
            .from('corporate_subscriptions')
            .update({
              assessments_used: subscription.assessments_used + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          if (updateError) {
            console.error('Error updating assessment count:', updateError);
            throw updateError;
          }
        }

        // Update quiz result
        const { error: updateError } = await supabaseAdmin
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            access_method: accessMethod,
            stripe_session_id: session.id,
            detailed_analysis: 'Your detailed analysis will be generated shortly.',
            category_scores: {
              'Self-Awareness': 8.5,
              'Emotional Intelligence': 7.8,
              'Moral Reasoning': 8.2,
              'Ethical Decision-Making': 7.9
            }
          })
          .eq('id', session.metadata.resultId);

        if (updateError) {
          console.error('Error updating quiz result:', updateError);
          throw updateError;
        }
      } else if (session.mode === 'subscription') {
        // Handle subscription purchase/update
        const { error: subscriptionError } = await supabaseAdmin
          .from('corporate_subscriptions')
          .upsert({
            organization_id: userId,
            subscription_tier: 'pro',
            max_assessments: 10,
            assessments_used: 0,
            active: true
          })
          .eq('organization_id', userId);

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          throw subscriptionError;
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});