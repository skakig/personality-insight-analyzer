
import { StripeEvent } from '../types.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

export async function handleRegularPurchase(event: StripeEvent) {
  console.log('Processing regular purchase event:', event.id);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    const session = event.data.object;
    console.log('Session data:', {
      id: session.id,
      status: session.status,
      hasResultId: !!session.metadata?.resultId,
      hasUserId: !!session.metadata?.userId,
      isGuest: session.metadata?.isGuest === 'true',
      hasTrackingId: !!session.metadata?.trackingId
    });

    if (session.status !== 'complete') {
      console.log('Skipping - session not complete');
      return { success: true, message: 'Session not complete, skipping.' };
    }

    let { resultId, userId, email, isGuest, trackingId } = session.metadata || {};

    // FALLBACK 1: If resultId is missing, try to retrieve it from purchase_tracking
    if (!resultId && session.id) {
      console.log('resultId missing from metadata, attempting to retrieve from purchase_tracking');
      
      const { data: purchaseTracking, error } = await supabase
        .from('purchase_tracking')
        .select('quiz_result_id')
        .eq('stripe_session_id', session.id)
        .single();

      if (!error && purchaseTracking?.quiz_result_id) {
        resultId = purchaseTracking.quiz_result_id;
        console.log('Successfully retrieved resultId from purchase_tracking:', resultId);
      } else {
        console.error('Failed to retrieve resultId from purchase_tracking:', error);
      }
    }

    // FALLBACK 2: If still no resultId, try to get it from quiz_results table using session ID
    if (!resultId && session.id) {
      console.log('Attempting to retrieve resultId from quiz_results using session ID');
      
      const { data: quizResult, error } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      if (!error && quizResult?.id) {
        resultId = quizResult.id;
        console.log('Successfully retrieved resultId from quiz_results:', resultId);
      } else {
        console.error('Failed to retrieve resultId from quiz_results:', error);
      }
    }

    if (!resultId) {
      console.error('No resultId found in metadata or fallback methods');
      return { 
        success: false, 
        message: 'No resultId could be determined for this purchase' 
      };
    }

    // Update quiz result purchase status
    const quizUpdateData = {
      is_purchased: true,
      is_detailed: true,
      purchase_status: 'completed',
      purchase_completed_at: new Date().toISOString(),
      access_method: 'purchase',
      stripe_session_id: session.id
    };

    // Update the quiz result
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update(quizUpdateData)
      .eq('id', resultId);

    if (resultError) {
      console.error('Error updating quiz result with session ID:', resultError);
      
      // Try updating again without the session ID check
      const { error: resultError2 } = await supabase
        .from('quiz_results')
        .update(quizUpdateData)
        .eq('id', resultId);
        
      if (resultError2) {
        console.error('Error updating quiz result by ID only:', resultError2);
        throw new Error(`Failed to update quiz result: ${resultError2.message}`);
      }
    }

    // Update purchase tracking record if trackingId is available
    if (trackingId) {
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', trackingId);

      if (trackingError) {
        console.error('Error updating purchase tracking by ID:', trackingError);
      }
    } else if (session.id) {
      // Try updating using the session ID if trackingId is not available
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session.id);

      if (trackingError) {
        console.error('Error updating purchase tracking by session ID (non-critical):', trackingError);
      }
    }

    console.log('Successfully updated purchase status for result:', resultId);
    
    return { 
      success: true,
      message: 'Purchase completed successfully',
      resultId,
      sessionId: session.id
    };
  } catch (error) {
    console.error('Error handling regular purchase:', error.message);
    throw error;
  }
}
