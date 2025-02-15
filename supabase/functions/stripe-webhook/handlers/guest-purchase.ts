
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
    // Send welcome email with account setup instructions
    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to The Moral Hierarchy - Complete Your Account Setup",
      html: `
        <h1>Welcome to The Moral Hierarchy!</h1>
        <p>Thank you for your purchase! Your subscription has been successfully activated.</p>
        <p>To access all features and secure your account, please complete your account setup:</p>
        <p><a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?type=signup&email=${email}">
          Click here to set up your password
        </a></p>
        <p>Purchase Details:</p>
        <ul>
          <li>Plan: ${session.metadata?.plan_type || 'Pro'}</li>
          <li>Amount: ${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `
    });

    console.log('Sent welcome email to:', email);
    
  } catch (error) {
    console.error('Error in guest purchase handler:', error);
  }
}
