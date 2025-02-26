
import { stripe } from '../utils';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types';

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleGuestPurchase(session: any) {
  try {
    console.log('Processing guest purchase:', session.id);

    const metadata = session.metadata;
    if (!metadata?.resultId || !metadata?.email) {
      throw new Error('Missing required metadata');
    }

    const accessToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days access

    // Create guest purchase record
    const { error: purchaseError } = await supabase
      .from('guest_purchases')
      .insert({
        result_id: metadata.resultId,
        email: metadata.email,
        access_token: accessToken,
        access_expires_at: expiresAt.toISOString(),
        status: 'completed',
        stripe_session_id: session.id,
        purchase_type: 'assessment'
      });

    if (purchaseError) throw purchaseError;

    // Update quiz result
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        purchase_status: 'completed',
        purchase_date: new Date().toISOString(),
        access_method: 'guest_purchase',
        guest_email: metadata.email,
        guest_access_token: accessToken,
        guest_access_expires_at: expiresAt.toISOString(),
        stripe_session_id: session.id
      })
      .eq('id', metadata.resultId);

    if (resultError) throw resultError;

    console.log('Successfully processed guest purchase:', {
      resultId: metadata.resultId,
      email: metadata.email
    });

    return { success: true };
  } catch (error) {
    console.error('Error in handleGuestPurchase:', error);
    throw error;
  }
}
