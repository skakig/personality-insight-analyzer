import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Database } from '../types.ts';
import { stripe } from '../utils.ts';

const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleGuestPurchase(session: any) {
  try {
    console.log('Processing guest purchase:', { 
      sessionId: session.id,
      metadata: session.metadata 
    });

    const metadata = session.metadata;
    if (!metadata?.resultId || !metadata?.email) {
      throw new Error('Missing required metadata');
    }

    // Important: Keep the same access token from the purchase tracking
    const { data: trackingData, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('quiz_result_id', metadata.resultId)
      .eq('guest_email', metadata.email)
      .single();

    if (trackingError) {
      console.error('Error fetching purchase tracking:', trackingError);
      throw trackingError;
    }

    if (!trackingData) {
      console.error('No purchase tracking found for:', {
        resultId: metadata.resultId,
        email: metadata.email
      });
      throw new Error('Purchase tracking not found');
    }

    // Use consistent access token
    const accessToken = trackingData.access_token || crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update purchase tracking
    const { error: updateTrackingError } = await supabase
      .from('purchase_tracking')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stripe_session_id: session.id,
        access_token: accessToken
      })
      .eq('id', trackingData.id);

    if (updateTrackingError) throw updateTrackingError;

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

    // Update quiz result with consistent token
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
      email: metadata.email,
      accessToken: accessToken
    });

    return { success: true };
  } catch (error) {
    console.error('Error in handleGuestPurchase:', error);
    throw error;
  }
}
