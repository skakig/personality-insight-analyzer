
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'npm:resend@2.0.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function handleGuestPurchase(session: any) {
  const { customer, customer_details } = session;
  const email = customer_details?.email;
  
  console.log('Processing guest purchase:', { 
    sessionId: session.id,
    email,
    customerId: customer
  });

  try {
    // Create a temporary login link
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        stripe_customer_id: customer,
        temp_access: true
      }
    });

    if (signUpError) {
      console.error('Error creating temporary user:', signUpError);
      throw signUpError;
    }

    // Generate a secure setup link
    const { data: { token }, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (linkError) {
      console.error('Error generating magic link:', linkError);
      throw linkError;
    }

    // Send welcome email with account setup instructions
    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to The Moral Hierarchy - Complete Your Account Setup",
      html: `
        <h1>Welcome to The Moral Hierarchy!</h1>
        <p>Thank you for your purchase! Your subscription has been successfully activated.</p>
        <p>To access all features and secure your account, click the link below to set up your password:</p>
        <p><a href="${token}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Secure Your Account
        </a></p>
        <p>Purchase Details:</p>
        <ul>
          <li>Plan: ${session.metadata?.plan_type || 'Pro'}</li>
          <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
        </ul>
        <p>You can now access your dashboard by clicking the link above. If you have any questions, please don't hesitate to contact us.</p>
        <p><small>This link will expire in 24 hours. If you need a new link, please contact support.</small></p>
      `
    });

    console.log('Sent welcome email to:', email);
    
    // Update guest subscription with user ID
    if (user) {
      await supabase
        .from('guest_subscriptions')
        .update({ 
          user_id: user.id,
          status: 'active'
        })
        .eq('session_id', session.id);
    }

  } catch (error) {
    console.error('Error in guest purchase handler:', error);
  }
}
