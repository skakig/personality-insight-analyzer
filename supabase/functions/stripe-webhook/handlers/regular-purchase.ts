
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
  const resultId = metadata?.resultId;
  const isSubscriptionPurchase = metadata?.type === 'subscription';

  console.log('Processing regular purchase:', {
    sessionId: session.id,
    email,
    userId,
    resultId,
    customerId: customer,
    isSubscriptionPurchase
  });

  try {
    if (resultId) {
      // Update quiz result access
      const updateData = {
        is_purchased: true,
        is_detailed: true,
        access_method: 'purchase',
        purchase_date: new Date().toISOString(),
        purchase_amount: session.amount_total
      };

      // If we have an email but no user ID (guest purchase), store the email
      if (email && !userId) {
        updateData.guest_email = email;
      }

      // If we have a user ID, associate the result with the user
      if (userId) {
        updateData.user_id = userId;
      }

      const { error: updateError } = await supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);

      if (updateError) throw updateError;
    }

    // Send appropriate purchase confirmation email
    const formattedAmount = `${session.currency.toUpperCase() === 'USD' ? '$' : ''}${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}`;
    
    let emailSubject = '';
    let emailContent = '';
    
    if (isSubscriptionPurchase) {
      emailSubject = 'Welcome to The Moral Hierarchy Pro!';
      emailContent = `
        <h1>Welcome to The Moral Hierarchy Pro!</h1>
        <p>Thank you for subscribing to The Moral Hierarchy!</p>
        <p>Your subscription has been successfully activated.</p>
        <p>Purchase Details:</p>
        <ul>
          <li>Plan: ${metadata?.plan_type || 'Pro'}</li>
          <li>Amount: ${formattedAmount}</li>
        </ul>
      `;
    } else {
      emailSubject = 'Your Full Report is Ready!';
      emailContent = `
        <h1>Thank You for Your Purchase!</h1>
        <p>Your Full Report is now ready to view.</p>
        <p>Purchase Details:</p>
        <ul>
          <li>Item: Full Detailed Report</li>
          <li>Amount: ${formattedAmount}</li>
        </ul>
        <p>You can access your full report here:</p>
        <p><a href="${Deno.env.get('SITE_URL')}/assessment/${resultId}">View Your Full Report</a></p>
      `;
    }

    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailContent
    });

    console.log('Successfully processed purchase and sent confirmation email');

  } catch (error) {
    console.error('Error in regular purchase handler:', error);
    throw error;
  }
}
