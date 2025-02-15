
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'npm:resend@2.0.0';
import { generateToken } from '../utils.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function handleGuestPurchase(session: any) {
  const { customer, customer_details } = session;
  const email = customer_details?.email;
  
  if (!email) {
    console.error('No email provided in session:', session);
    throw new Error('No email provided in session');
  }
  
  console.log('Processing guest purchase:', { 
    sessionId: session.id,
    email,
    customerId: customer
  });

  try {
    // Generate secure token for account setup
    const setupToken = generateToken();
    
    // Store temporary access token
    const { data: tempToken, error: tokenError } = await supabase
      .from('temp_access_tokens')
      .insert({
        email,
        token: setupToken,
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating temp token:', tokenError);
      throw tokenError;
    }

    // Create temporary user account
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        stripe_customer_id: customer,
        temp_access: true,
        setup_token: setupToken
      }
    });

    if (signUpError) {
      console.error('Error creating temporary user:', signUpError);
      throw signUpError;
    }

    // Update guest subscription
    if (user) {
      const { error: subscriptionError } = await supabase
        .from('guest_subscriptions')
        .update({ 
          user_id: user.id,
          status: 'active',
          stripe_session_id: session.id,
          temp_access_token: tempToken.id
        })
        .eq('session_id', session.id);

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        throw subscriptionError;
      }
    }

    // Generate secure account setup URL
    const setupUrl = `${Deno.env.get('SITE_URL')}/setup-account?token=${setupToken}`;

    // Send welcome email with account setup link
    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to The Moral Hierarchy - Complete Your Account Setup",
      html: `
        <h1>Welcome to The Moral Hierarchy!</h1>
        <p>Thank you for your purchase! Your subscription has been successfully activated.</p>
        <p>To access all features and secure your account, click the button below:</p>
        <p style="margin: 2em 0;">
          <a href="${setupUrl}" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Secure Your Account
          </a>
        </p>
        <p>Purchase Details:</p>
        <ul>
          <li>Plan: ${session.metadata?.plan_type || 'Pro'}</li>
          <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
        </ul>
        <p><strong>Important:</strong> You can access your dashboard immediately using this secure link. We recommend setting up your password to ensure continued access to your account.</p>
        <p><small>This setup link will expire in 24 hours for security reasons. If you need a new link, please contact support.</small></p>
      `
    });

    console.log('Successfully processed guest purchase:', {
      email,
      userId: user?.id,
      setupToken: setupToken
    });

  } catch (error) {
    console.error('Error in guest purchase handler:', error);
    throw error;
  }
}
