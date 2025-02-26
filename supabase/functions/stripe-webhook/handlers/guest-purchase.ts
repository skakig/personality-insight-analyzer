
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

    // Important: First check if this purchase was already processed
    const { data: existingPurchase } = await supabase
      .from('guest_purchases')
      .select('*')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existingPurchase) {
      console.log('Purchase already processed:', session.id);
      return { success: true };
    }

    // Get tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('purchase_tracking')
      .select('*')
      .eq('id', metadata.trackingId)
      .maybeSingle();

    if (trackingError) {
      console.error('Error fetching tracking:', trackingError);
      
      // Fallback: Try to find by result and email
      const { data: fallbackTracking, error: fallbackError } = await supabase
        .from('purchase_tracking')
        .select('*')
        .eq('quiz_result_id', metadata.resultId)
        .eq('guest_email', metadata.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (fallbackError || !fallbackTracking) {
        throw new Error('Could not find valid purchase tracking');
      }
    }

    const accessToken = metadata.accessToken || tracking?.access_token || crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

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

    // Update tracking status
    if (tracking?.id) {
      await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id
        })
        .eq('id', tracking.id);
    }

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
      email: metadata.email,
      accessToken: accessToken,
      sessionId: session.id
    });

    return { success: true };
  } catch (error) {
    console.error('Error in handleGuestPurchase:', error);
    throw error;
  }
}
