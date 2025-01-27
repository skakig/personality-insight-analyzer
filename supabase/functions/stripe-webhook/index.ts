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
      const resultId = session.metadata?.resultId;

      if (session.mode === 'payment' && resultId) {
        // Get the quiz result and user details
        const { data: quizResult } = await supabaseAdmin
          .from('quiz_results')
          .select('personality_type, category_scores, detailed_analysis')
          .eq('id', resultId)
          .single();

        if (!quizResult) {
          throw new Error('Quiz result not found');
        }

        // Update quiz result with purchase details
        const { error: updateError } = await supabaseAdmin
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            access_method: accessMethod,
            stripe_session_id: session.id
          })
          .eq('id', resultId);

        if (updateError) {
          console.error('Error updating quiz result:', updateError);
          throw updateError;
        }

        // Get user's email
        const { data: userProfile } = await supabaseAdmin
          .auth.admin.getUserById(userId);

        if (userProfile?.user?.email) {
          // Send detailed report email
          const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              email: userProfile.user.email,
              personalityType: quizResult.personality_type,
              analysis: quizResult.detailed_analysis,
              scores: quizResult.category_scores
            }),
          });

          if (!emailResponse.ok) {
            console.error('Error sending detailed report email:', await emailResponse.text());
          }
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