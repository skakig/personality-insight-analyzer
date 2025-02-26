
import { stripe } from '../utils';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types';

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleRegularPurchase(session: any) {
  try {
    console.log('Processing regular purchase:', session.id);

    const metadata = session.metadata;
    if (!metadata?.resultId) {
      throw new Error('No result ID in session metadata');
    }

    // Update purchase tracking
    const { error: trackingError } = await supabase
      .from('purchase_tracking')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stripe_session_id: session.id
      })
      .eq('quiz_result_id', metadata.resultId);

    if (trackingError) throw trackingError;

    // Update quiz result
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        purchase_status: 'completed',
        purchase_date: new Date().toISOString(),
        access_method: 'purchase',
        stripe_session_id: session.id
      })
      .eq('id', metadata.resultId);

    if (resultError) throw resultError;

    console.log('Successfully processed purchase for result:', metadata.resultId);
    return { success: true };
  } catch (error) {
    console.error('Error in handleRegularPurchase:', error);
    throw error;
  }
}
