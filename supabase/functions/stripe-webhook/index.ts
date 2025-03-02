
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const updateAffiliateSales = async (
  sessionId: string,
  purchaseAmount: number
) => {
  try {
    console.log("Tracking affiliate sales for session ID:", sessionId);

    // Get the session to retrieve metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const couponCode = session?.metadata?.couponCode;

    if (!couponCode) {
      console.log("No coupon code found in session metadata");
      return;
    }
    
    console.log("Processing affiliate sale with coupon:", couponCode);

    // First, find the coupon used in this session
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*, affiliates(*)')
      .eq('code', couponCode)
      .single();

    if (couponError || !coupon?.affiliate_id) {
      console.error("Error fetching coupon or not an affiliate coupon:", couponError?.message);
      return;
    }

    const affiliate = coupon.affiliates;
    if (!affiliate) {
      console.log("Affiliate not found for coupon:", couponCode);
      return;
    }

    console.log("Found affiliate for coupon:", affiliate.name);

    // Calculate commission
    const commissionRate = affiliate.commission_rate;
    const commissionAmount = purchaseAmount * commissionRate;

    console.log("Calculated commission:", {
      purchaseAmount,
      commissionRate,
      commissionAmount
    });

    // Update affiliate stats
    const { error: updateError } = await supabase
      .from('affiliates')
      .update({
        total_sales: affiliate.total_sales + purchaseAmount,
        earnings: affiliate.earnings + commissionAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', affiliate.id);

    if (updateError) {
      console.error("Error updating affiliate stats:", updateError);
      return;
    }

    console.log("Successfully tracked affiliate purchase for:", affiliate.name);
  } catch (error) {
    console.error("Error in updateAffiliateSales:", error);
  }
};

const handleEvent = async (event: any) => {
  try {
    console.log(`Processing event: ${event.type}`);
    
    // Log event to database
    const { data: eventData, error: eventError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        raw_event: event,
        status: 'processing'
      })
      .select()
      .single();
      
    if (eventError) {
      console.error('Error storing event:', eventError);
      throw eventError;
    }
    
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout completed:', session.id);
      
      // Extract important metadata
      const resultId = session.metadata?.resultId;
      const userId = session.metadata?.userId;
      const accessToken = session.metadata?.accessToken;
      const trackingId = session.metadata?.trackingId;
      
      console.log('Session metadata:', { 
        resultId, 
        userId, 
        hasAccessToken: !!accessToken,
        hasTrackingId: !!trackingId
      });
      
      // Handle purchase tracking update
      if (trackingId) {
        const { error: trackingError } = await supabase
          .from('purchase_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', trackingId);
          
        if (trackingError) {
          console.error('Error updating tracking:', trackingError);
        } else {
          console.log('Updated purchase tracking:', trackingId);
        }
      }
      
      // Check if this involves a quiz result
      if (resultId) {
        console.log('Updating quiz result:', resultId);
        
        // Update quiz result with purchase information
        const { error: resultError } = await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: userId ? 'purchase' : 'guest_purchase'
          })
          .eq('id', resultId);
          
        if (resultError) {
          console.error('Error updating quiz result:', resultError);
        } else {
          console.log('Successfully updated quiz result:', resultId);
        }
        
        // Track affiliate commission for this purchase
        if (session.metadata?.couponCode) {
          await updateAffiliateSales(
            session.id,
            session.amount_total / 100 // Convert from cents to dollars
          );
        }
      }
      
      // Update event record to completed
      await supabase
        .from('stripe_webhook_events')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', eventData.id);
        
      console.log('Webhook processing completed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error handling webhook event:', error);
    
    // Try to update event record with error
    try {
      await supabase
        .from('stripe_webhook_events')
        .update({
          status: 'error',
          error_message: error.message || 'Unknown error'
        })
        .eq('stripe_event_id', event.id);
    } catch (dbError) {
      console.error('Error updating event record:', dbError);
    }
    
    return false;
  }
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("No signature found in request");
    return new Response(JSON.stringify({ error: "No signature found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const body = await req.text();
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Handle the event
    await handleEvent(event);
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
