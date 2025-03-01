
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleRegularPurchase(session: any) {
  console.log('Handling regular purchase');
  
  try {
    // Extract the relevant data from the session
    const metadata = session.metadata || {};
    const resultId = metadata.resultId;
    const userId = metadata.userId;
    const trackingId = metadata.trackingId;
    
    console.log(`Processing purchase for result: ${resultId}, user: ${userId}, tracking: ${trackingId}`);

    if (!resultId) {
      console.error('No resultId found in metadata');
      return { status: 400, message: 'Missing resultId in metadata' };
    }

    // 1. Update the quiz result to mark it as purchased
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        is_detailed: true,
        access_method: 'purchase',
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        stripe_session_id: session.id
      })
      .eq('id', resultId);

    if (resultError) {
      console.error(`Error updating quiz result: ${resultError.message}`);
      throw resultError;
    }

    // 2. Update the purchase tracking record if it exists
    if (trackingId) {
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id
        })
        .eq('id', trackingId);

      if (trackingError) {
        console.error(`Error updating purchase tracking: ${trackingError.message}`);
        // Don't throw here - we still want to complete the rest of the process
      }
    }

    // 3. Log the successful purchase
    await supabase
      .from('purchase_logs')
      .insert({
        quiz_result_id: resultId,
        user_id: userId,
        stripe_session_id: session.id,
        amount_paid: session.amount_total,
        payment_status: session.payment_status,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        payment_method: session.payment_method_types?.[0]
      })
      .select();

    console.log(`Successfully processed purchase for result ${resultId}`);
    
    return { 
      status: 200, 
      received: true,
      message: 'Purchase processed successfully' 
    };
  } catch (error) {
    console.error(`Error processing regular purchase: ${error.message}`);
    console.error(error.stack);
    
    // Still return a response that Stripe will accept
    return { 
      status: 200, 
      received: true,
      success: false,
      message: 'Processed with errors'
    };
  }
}
