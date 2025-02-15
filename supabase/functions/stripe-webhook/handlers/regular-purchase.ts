
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'npm:resend@2.0.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function handleRegularPurchase(session: any) {
  const { customer, customer_details, metadata } = session;
  const email = customer_details?.email;
  const userId = metadata?.userId;

  console.log('Processing regular purchase:', {
    sessionId: session.id,
    email,
    userId,
    customerId: customer
  });

  try {
    // Update subscription status
    if (userId) {
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customer,
          stripe_subscription_id: session.subscription,
          stripe_price_id: metadata?.priceId,
          status: 'active',
          plan_type: metadata?.plan_type || 'pro'
        });
    }

    // Update quiz result access
    if (metadata?.resultId) {
      await supabase
        .from('quiz_results')
        .update({ 
          is_purchased: true,
          is_detailed: true,
          access_method: 'purchase'
        })
        .eq('id', metadata.resultId);
    }

    // Send purchase confirmation email
    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: "Thank You for Your Purchase!",
      html: `
        <h1>Purchase Confirmation</h1>
        <p>Thank you for subscribing to The Moral Hierarchy!</p>
        <p>Your subscription has been successfully activated.</p>
        <p>Purchase Details:</p>
        <ul>
          <li>Plan: ${metadata?.plan_type || 'Pro'}</li>
          <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
        </ul>
        <p>You can now access your full report by visiting:</p>
        <p><a href="${Deno.env.get('SITE_URL')}/assessment/${metadata?.resultId}">View Your Full Report</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `
    });

    console.log('Sent confirmation email to:', email);

  } catch (error) {
    console.error('Error in regular purchase handler:', error);
  }
}
