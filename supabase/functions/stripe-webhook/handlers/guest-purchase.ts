
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const handleGuestPurchase = async (
  supabase: SupabaseClient,
  session: any
) => {
  const metadata = session.metadata;
  
  console.log('Processing guest purchase:', {
    sessionId: session.id,
    metadata,
    timestamp: new Date().toISOString()
  });

  if (!metadata.resultId) {
    throw new Error('No result ID found in metadata');
  }

  try {
    // 1. Update the quiz result
    const { error: resultError } = await supabase
      .from('quiz_results')
      .update({
        is_purchased: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        guest_email: session.customer_details.email,
        access_method: 'purchase'
      })
      .eq('id', metadata.resultId);

    if (resultError) throw resultError;

    // 2. Update purchase tracking
    const { error: trackingError } = await supabase
      .from('purchase_tracking')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        guest_email: session.customer_details.email
      })
      .eq('quiz_result_id', metadata.resultId);

    if (trackingError) throw trackingError;

    // 3. Generate a temp access token
    const accessToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days access

    const { error: tokenError } = await supabase
      .from('quiz_results')
      .update({
        guest_access_token: accessToken,
        guest_access_expires_at: expiresAt.toISOString()
      })
      .eq('id', metadata.resultId);

    if (tokenError) throw tokenError;

    // 4. Store the email for marketing
    const { error: subscriberError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: session.customer_details.email
      }, {
        onConflict: 'email'
      });

    if (subscriberError) {
      console.error('Error adding to newsletter:', subscriberError);
      // Don't throw, this is non-critical
    }

    // 5. Send confirmation email with report link and account creation option
    await supabase.functions.invoke('send-results', {
      body: {
        email: session.customer_details.email,
        resultId: metadata.resultId,
        accessToken,
        isGuest: true
      }
    });

    console.log('Guest purchase completed successfully:', {
      resultId: metadata.resultId,
      email: session.customer_details.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in guest purchase handler:', error);
    throw error;
  }
};
