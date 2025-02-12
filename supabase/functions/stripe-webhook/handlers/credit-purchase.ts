
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleCreditPurchase(session: any, userId: string) {
  await updateCreditPurchaseStatus(session.id);
  await updateUserSubscription(userId, session.metadata?.amount);
}

async function updateCreditPurchaseStatus(sessionId: string) {
  const { error: updateError } = await supabaseAdmin
    .from('credit_purchases')
    .update({ status: 'completed' })
    .eq('stripe_session_id', sessionId);

  if (updateError) {
    console.error('Error updating credit purchase:', updateError);
    throw updateError;
  }
}

async function updateUserSubscription(userId: string, amountStr: string = '0') {
  const amount = parseInt(amountStr);
  const { error: subscriptionError } = await supabaseAdmin
    .from('corporate_subscriptions')
    .upsert({
      organization_id: userId,
      max_assessments: amount,
      assessments_used: 0,
      subscription_tier: 'credits',
      active: true
    });

  if (subscriptionError) {
    console.error('Error updating subscription:', subscriptionError);
    throw subscriptionError;
  }
}
