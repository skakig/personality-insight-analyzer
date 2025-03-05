
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    // Get session ID from request body
    const { sessionId } = await req.json().catch(() => ({}));
    console.log('Verifying book purchase for session:', sessionId);

    if (!sessionId) {
      console.error('Missing session ID in request');
      return new Response(
        JSON.stringify({ error: 'Missing session ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if session exists in the database
    const { data: existingSession, error: dbError } = await supabaseClient
      .from('book_purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    
    console.log('Database query result:', { existingSession, dbError });

    if (existingSession?.status === 'completed') {
      console.log('Purchase already verified in database');
      return new Response(
        JSON.stringify({ verified: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If not found in database, verify with Stripe
    try {
      console.log('Verifying with Stripe API');
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log('Stripe session retrieved:', {
        id: session.id,
        status: session.payment_status,
        customer: session.customer_details?.email
      });
      
      if (session.payment_status === 'paid') {
        console.log('Payment verified as paid');
        
        // Save verified purchase to database
        const { error: insertError } = await supabaseClient
          .from('book_purchases')
          .upsert({
            stripe_session_id: sessionId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            email: session.customer_details?.email,
            amount_total: session.amount_total,
            payment_status: session.payment_status,
          }, {
            onConflict: 'stripe_session_id'
          });

        if (insertError) {
          console.error('Error saving purchase:', insertError);
        }

        return new Response(
          JSON.stringify({ verified: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        console.log('Payment not completed', session.payment_status);
        return new Response(
          JSON.stringify({ 
            verified: false, 
            message: 'Payment not completed',
            status: session.payment_status
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          message: 'Error verifying with Stripe',
          error: stripeError.message
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
