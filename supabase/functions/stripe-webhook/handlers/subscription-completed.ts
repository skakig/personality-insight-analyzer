
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleSubscriptionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing completed subscription:', session.id);

  const subscription = session.subscription as string;
  const customer = session.customer as string;
  const metadata = session.metadata || {};
  
  if (metadata.userId) {
    // Handle authenticated user subscription
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: metadata.userId,
        stripe_customer_id: customer,
        stripe_subscription_id: subscription,
        stripe_price_id: session.metadata?.priceId,
        status: 'active',
        plan_type: session.metadata?.plan_type || 'pro'
      });
  } else {
    // Update guest subscription status
    await supabase
      .from('guest_subscriptions')
      .update({
        stripe_subscription_id: subscription,
        status: 'active'
      })
      .eq('session_id', session.id);
  }
}
