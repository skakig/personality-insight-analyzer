
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
      isGuest: session.metadata?.isGuest === 'true'
    });

    if (session.status !== 'complete') {
      console.log('Skipping - session not complete');
      return { success: true, message: 'Session not complete, skipping.' };
    }

    const { resultId, userId, email, isGuest } = session.metadata || {};

    if (!resultId) {
      console.log('Skipping - no resultId in metadata');
      return { success: true, message: 'No result ID in metadata, skipping.' };
    }

    // Update quiz result purchase status
    const quizUpdateData: any = {
      is_purchased: true,
      is_detailed: true,
      purchase_status: 'completed',
      purchase_completed_at: new Date().toISOString(),
      access_method: 'purchase'
    };

    // Update the quiz result
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update(quizUpdateData)
      .eq('id', resultId)
      .eq('stripe_session_id', session.id);

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

    // Update purchase tracking record
    const { error: trackingError } = await supabase
      .from('purchase_tracking')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('stripe_session_id', session.id);

    if (trackingError) {
      console.error('Error updating purchase tracking (non-critical):', trackingError);
      // Continue anyway, this is secondary
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
