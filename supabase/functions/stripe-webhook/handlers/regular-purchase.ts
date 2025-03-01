
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
    let resultId = metadata.resultId;
    const userId = metadata.userId;
    const trackingId = metadata.trackingId;
    const email = metadata.email;
    
    console.log(`Processing purchase for result: ${resultId}, user: ${userId}, tracking: ${trackingId}, email: ${email}`);

    // Recovery mechanism for missing resultId
    if (!resultId) {
      console.error('No resultId found in metadata, attempting recovery...');
      
      // Try to retrieve from tracking record first if we have a tracking ID
      if (trackingId) {
        const { data: trackingData } = await supabase
          .from('purchase_tracking')
          .select('quiz_result_id')
          .eq('id', trackingId)
          .maybeSingle();
          
        if (trackingData?.quiz_result_id) {
          resultId = trackingData.quiz_result_id;
          console.log(`Recovered resultId ${resultId} from tracking ID ${trackingId}`);
        }
      }
      
      // If not found and we have a session ID, try to lookup by stripe_session_id
      if (!resultId) {
        const { data: sessionData } = await supabase
          .from('quiz_results')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle();
          
        if (sessionData?.id) {
          resultId = sessionData.id;
          console.log(`Recovered resultId ${resultId} from stripe_session_id ${session.id}`);
        }
      }
      
      // Last resort: try to find by user_id if available
      if (!resultId && userId) {
        const { data: userResults } = await supabase
          .from('quiz_results')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (userResults?.id) {
          resultId = userResults.id;
          console.log(`Recovered resultId ${resultId} from user ID ${userId}`);
        }
      }
      
      if (!resultId) {
        console.error('Failed to recover resultId through all recovery methods');
        // We'll still try to log the event, but return a failure
        await logFailedPurchase(session, "missing_result_id");
        return { 
          status: 200, // Still return 200 to Stripe to avoid retries
          received: true,
          success: false,
          message: 'Failed to process purchase: missing result ID' 
        };
      }
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
        stripe_session_id: session.id,
        guest_email: email || null // Ensure guest email is captured
      })
      .eq('id', resultId);

    if (resultError) {
      console.error(`Error updating quiz result: ${resultError.message}`);
      await logFailedPurchase(session, "quiz_result_update_failed");
      // Don't throw, continue with other updates
    }

    // 2. Deal with purchase_tracking record
    // First check if a tracking record exists for this session
    let trackingRecordId = trackingId;
    if (!trackingRecordId) {
      // Try to find existing tracking by session ID or result ID
      const { data: existingTracking } = await supabase
        .from('purchase_tracking')
        .select('id')
        .or(`stripe_session_id.eq.${session.id},quiz_result_id.eq.${resultId}`)
        .maybeSingle();
      
      if (existingTracking?.id) {
        trackingRecordId = existingTracking.id;
        console.log(`Found existing tracking record: ${trackingRecordId}`);
      }
    }

    if (trackingRecordId) {
      // Update existing tracking record
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id,
          quiz_result_id: resultId // Ensure this is set
        })
        .eq('id', trackingRecordId);

      if (trackingError) {
        console.error(`Error updating purchase tracking: ${trackingError.message}`);
        // Continue anyway, this is not critical
      } else {
        console.log(`Updated tracking record ${trackingRecordId} successfully`);
      }
    } else {
      // Create a new tracking record if none exists
      console.log("No existing tracking record found, creating a new one");
      const { error: newTrackingError } = await supabase
        .from('purchase_tracking')
        .insert({
          quiz_result_id: resultId,
          user_id: userId,
          guest_email: email || null,
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id
        });
        
      if (newTrackingError) {
        console.error(`Error creating new purchase tracking: ${newTrackingError.message}`);
        // Continue anyway, this is not critical
      } else {
        console.log(`Created new tracking record for result ${resultId}`);
      }
    }

    // 3. Log the successful purchase
    try {
      await supabase
        .from('purchase_logs')
        .insert({
          quiz_result_id: resultId,
          user_id: userId,
          stripe_session_id: session.id,
          amount_paid: session.amount_total,
          payment_status: session.payment_status,
          currency: session.currency,
          customer_email: session.customer_details?.email || email,
          payment_method: session.payment_method_types?.[0]
        });
      console.log('Successfully logged purchase details');
    } catch (logError) {
      console.error(`Error logging purchase: ${logError.message}`);
      // Continue anyway, this is not critical
    }

    console.log(`Successfully processed purchase for result ${resultId}`);
    
    return { 
      status: 200, 
      received: true,
      success: true,
      message: 'Purchase processed successfully',
      resultId
    };
  } catch (error) {
    console.error(`Error processing regular purchase: ${error.message}`);
    console.error(error.stack);
    
    // Log the failure
    await logFailedPurchase(session, "unexpected_error");
    
    // Still return a response that Stripe will accept
    return { 
      status: 200, 
      received: true,
      success: false,
      message: 'Processed with errors: ' + error.message
    };
  }
}

// Helper function to log failed purchases
async function logFailedPurchase(session: any, failureReason: string) {
  try {
    await supabase
      .from('purchase_logs')
      .insert({
        stripe_session_id: session.id,
        amount_paid: session.amount_total,
        payment_status: 'failed',
        failure_reason: failureReason,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        payment_method: session.payment_method_types?.[0],
        raw_event: session
      });
    console.log(`Logged failed purchase with reason: ${failureReason}`);
  } catch (error) {
    console.error(`Failed to log purchase failure: ${error.message}`);
  }
}
