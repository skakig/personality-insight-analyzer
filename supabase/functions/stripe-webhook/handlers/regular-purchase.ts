
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'npm:resend@2.0.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handleRegularPurchase(session: any) {
  console.log('Processing purchase session:', session);
  
  const { customer, customer_details, metadata } = session;
  const email = customer_details?.email;
  const userId = metadata?.userId;
  const resultId = metadata?.resultId;
  const purchaseType = metadata?.type || 'report';

  try {
    // 1. Update the quiz result first
    if (resultId) {
      console.log('Updating quiz result:', { resultId, email, userId });
      
      const updateData: any = {
        is_purchased: true,
        is_detailed: true,
        access_method: 'purchase',
        purchase_date: new Date().toISOString(),
        purchase_amount: session.amount_total,
        stripe_session_id: session.id
      };

      // For guest purchases, store the email
      if (email && !userId) {
        updateData.guest_email = email;
        
        // Generate a temporary access token
        const tempToken = crypto.randomUUID();
        updateData.temp_access_token = tempToken;
        updateData.temp_access_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        
        // Store token for future account linking
        await supabase.from('temp_access_tokens').insert({
          token: tempToken,
          email: email,
          result_id: resultId
        });
      }

      // If we have a userId, associate it directly
      if (userId) {
        updateData.user_id = userId;
      }

      const { error: updateError } = await supabase
        .from('quiz_results')
        .update(updateData)
        .eq('id', resultId);

      if (updateError) {
        console.error('Error updating quiz result:', updateError);
        throw updateError;
      }
    }

    // 2. Send appropriate email based on purchase type
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: session.currency.toUpperCase()
    }).format(session.amount_total / 100);

    const siteUrl = Deno.env.get('SITE_URL') || 'https://themoralhierarchy.com';
    const reportUrl = `${siteUrl}/assessment/${resultId}`;
    
    let emailSubject = '';
    let emailContent = '';

    if (purchaseType === 'subscription') {
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
        <p>You can now access all premium features and reports.</p>
      `;
    } else {
      emailSubject = 'Your Moral Hierarchy Full Report is Ready!';
      
      // Different content for guest vs signed-in users
      if (userId) {
        emailContent = `
          <h1>Thank You for Your Purchase!</h1>
          <p>Your Full Report is now ready to view.</p>
          <p>Purchase Details:</p>
          <ul>
            <li>Item: Detailed Moral Analysis Report</li>
            <li>Amount: ${formattedAmount}</li>
          </ul>
          <p>Access your report here:</p>
          <p><a href="${reportUrl}">View Your Full Report</a></p>
        `;
      } else {
        emailContent = `
          <h1>Thank You for Your Purchase!</h1>
          <p>Your Full Report is now ready to view.</p>
          <p>Purchase Details:</p>
          <ul>
            <li>Item: Detailed Moral Analysis Report</li>
            <li>Amount: ${formattedAmount}</li>
          </ul>
          <p>Access your report here:</p>
          <p><a href="${reportUrl}">View Your Full Report</a></p>
          <p>To save your report and access it anytime:</p>
          <p><a href="${siteUrl}/auth?setup=true&email=${encodeURIComponent(email)}">Create Your Account</a></p>
          <p><small>Your report will be automatically linked to your account when you sign up with this email.</small></p>
        `;
      }
    }

    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailContent
    });

    console.log('Successfully sent confirmation email to:', email);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in regular purchase handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
