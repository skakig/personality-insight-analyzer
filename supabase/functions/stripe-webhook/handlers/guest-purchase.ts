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
  
  console.log('Processing purchase for email:', email);

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    const user = existingUser?.users?.[0];
    let setupUrl: string | undefined;

    if (!user) {
      // New user flow
      console.log('Creating new user account for:', email);
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

      // Create new user account
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          stripe_customer_id: customer,
          temp_access: true,
          setup_token: setupToken
        }
      });

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        throw signUpError;
      }

      setupUrl = `${Deno.env.get('SITE_URL')}/setup-account?token=${setupToken}`;
    }

    // Update or create subscription
    const { error: subscriptionError } = await supabase
      .from('guest_subscriptions')
      .update({ 
        user_id: user?.id,
        status: 'active',
        stripe_session_id: session.id,
      })
      .eq('session_id', session.id);

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      throw subscriptionError;
    }

    // Send appropriate email based on user status
    if (setupUrl) {
      // New user email
      await resend.emails.send({
        from: "The Moral Hierarchy <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to The Moral Hierarchy - Complete Your Account Setup",
        html: `
          <h1>Welcome to The Moral Hierarchy!</h1>
          <p>Thank you for your purchase! Your report is ready to view.</p>
          <p>To access all features and secure your account, click the button below:</p>
          <p style="margin: 2em 0;">
            <a href="${setupUrl}" 
               style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Secure Your Account
            </a>
          </p>
          <p>Purchase Details:</p>
          <ul>
            <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
          </ul>
          <p><strong>Important:</strong> You can access your report immediately using this secure link. We recommend setting up your password to ensure continued access to your account.</p>
          <p><small>This setup link will expire in 24 hours for security reasons. If you need a new link, please contact support.</small></p>
        `
      });
    } else {
      // Existing user email
      const reportUrl = `${Deno.env.get('SITE_URL')}/assessment/${session.metadata?.resultId}`;
      
      await resend.emails.send({
        from: "The Moral Hierarchy <onboarding@resend.dev>",
        to: [email],
        subject: "Your Moral Hierarchy Report is Ready",
        html: `
          <h1>Thank You for Your Purchase!</h1>
          <p>Your detailed report is now ready to view.</p>
          <p>You can access your report by logging into your account and visiting:</p>
          <p style="margin: 2em 0;">
            <a href="${reportUrl}" 
               style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Your Report
            </a>
          </p>
          <p>Purchase Details:</p>
          <ul>
            <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
          </ul>
          <p>If you have any questions about your report, please don't hesitate to reach out to our support team.</p>
        `
      });
    }

    console.log('Successfully processed purchase:', {
      email,
      isNewUser: !!setupUrl,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error in purchase handler:', error);
    throw error;
  }
}
