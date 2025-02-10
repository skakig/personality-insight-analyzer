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

      // Handle guest purchase
      if (session.metadata?.isGuest === 'true') {
        const { data: guestPurchase, error: guestError } = await supabaseAdmin
          .from('guest_purchases')
          .update({ status: 'completed' })
          .eq('stripe_session_id', session.id)
          .select()
          .single();

        if (guestError) {
          console.error('Error updating guest purchase:', guestError);
          throw guestError;
        }

        if (guestPurchase?.result_id) {
          // Update quiz result to mark it as purchased
          const { error: updateError } = await supabaseAdmin
            .from('quiz_results')
            .update({
              is_purchased: true,
              is_detailed: true,
              access_method: 'guest_purchase'
            })
            .eq('id', guestPurchase.result_id);

          if (updateError) {
            console.error('Error updating quiz result:', updateError);
            throw updateError;
          }

          // Send email with detailed report
          const { data: quizResult } = await supabaseAdmin
            .from('quiz_results')
            .select('personality_type, detailed_analysis, category_scores')
            .eq('id', guestPurchase.result_id)
            .single();

          if (quizResult) {
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                email: guestPurchase.email,
                personalityType: quizResult.personality_type,
                analysis: quizResult.detailed_analysis,
                scores: quizResult.category_scores,
                isPdf: true
              }),
            });

            if (!emailResponse.ok) {
              console.error('Error sending email:', await emailResponse.text());
              throw new Error('Failed to send email');
            }
          }
        }
      } else {
        // Handle regular authenticated user purchase
        const customerId = session.customer;
        const customer = await stripe.customers.retrieve(customerId as string);
        const userId = customer.metadata.supabaseUid;
        const accessMethod = session.metadata?.accessMethod;
        const resultId = session.metadata?.resultId;
        const isGift = session.metadata?.isGift === 'true';
        const giftRecipientEmail = session.metadata?.giftRecipientEmail;

        if (resultId) {
          // Get the quiz result and user details
          const { data: quizResult } = await supabaseAdmin
            .from('quiz_results')
            .select('personality_type, category_scores, detailed_analysis')
            .eq('id', resultId)
            .single();

          if (!quizResult) {
            throw new Error('Quiz result not found');
          }

          if (isGift && giftRecipientEmail) {
            // Create a new quiz result for the gift recipient
            const { data: giftResult, error: giftError } = await supabaseAdmin
              .from('quiz_results')
              .insert({
                personality_type: quizResult.personality_type,
                category_scores: quizResult.category_scores,
                detailed_analysis: quizResult.detailed_analysis,
                is_purchased: true,
                is_detailed: true,
                access_method: 'gift',
                stripe_session_id: session.id
              })
              .select()
              .single();

            if (giftError) {
              console.error('Error creating gift result:', giftError);
              throw giftError;
            }

            // Send email to gift recipient
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                email: giftRecipientEmail,
                personalityType: quizResult.personality_type,
                analysis: quizResult.detailed_analysis,
                scores: quizResult.category_scores,
                giftCode: giftResult.id
              }),
            });

            if (!emailResponse.ok) {
              console.error('Error sending gift email:', await emailResponse.text());
              throw new Error('Failed to send gift email');
            }
          } else {
            // Update the original quiz result
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

            // Send email to purchaser
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                email: customer.email,
                personalityType: quizResult.personality_type,
                analysis: quizResult.detailed_analysis,
                scores: quizResult.category_scores
              }),
            });

            if (!emailResponse.ok) {
              console.error('Error sending email:', await emailResponse.text());
              throw new Error('Failed to send email');
            }
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
