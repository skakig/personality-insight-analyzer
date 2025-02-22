
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
  
  const { customer_details, metadata } = session;
  const email = customer_details?.email;
  const userId = metadata?.userId;
  const resultId = metadata?.resultId;
  const purchaseTrackingId = metadata?.purchaseTrackingId;

  try {
    // 1. Update purchase tracking status
    if (purchaseTrackingId) {
      const { error: trackingError } = await supabase
        .from('purchase_tracking')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_session_id: session.id
        })
        .eq('id', purchaseTrackingId);

      if (trackingError) {
        console.error('Error updating purchase tracking:', trackingError);
        throw trackingError;
      }
    }

    // 2. Update the quiz result
    if (resultId) {
      console.log('Updating quiz result:', { resultId, email, userId });
      
      const updateData: any = {
        is_purchased: true,
        is_detailed: true,
        purchase_status: 'completed',
        purchase_completed_at: new Date().toISOString(),
        access_method: 'purchase',
        purchase_date: new Date().toISOString(),
        purchase_amount: session.amount_total,
        stripe_session_id: session.id
      };

      // For guest purchases, store the email and generate temp access
      if (email && !userId) {
        updateData.guest_email = email;
        updateData.temp_access_token = crypto.randomUUID();
        updateData.temp_access_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      // If we have a userId, associate it
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

    // 3. Send confirmation email
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: session.currency.toUpperCase()
    }).format(session.amount_total / 100);

    const siteUrl = Deno.env.get('SITE_URL') || 'https://themoralhierarchy.com';
    const reportUrl = `${siteUrl}/assessment/${resultId}`;

    const emailSubject = 'Your Moral Hierarchy Full Report is Ready!';
    let emailContent = '';

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

    await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailContent
    });

    console.log('Successfully processed purchase and sent confirmation email');
    
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
