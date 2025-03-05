
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resultId, accessToken, isGuest } = await req.json();

    const reportUrl = isGuest 
      ? `https://themoralhierarchy.com/assessment/${resultId}?token=${accessToken}`
      : `https://themoralhierarchy.com/assessment/${resultId}`;

    const signupUrl = `https://themoralhierarchy.com/auth?email=${encodeURIComponent(email)}&action=signup`;

    const { data, error } = await resend.emails.send({
      from: 'The Moral Hierarchy <onboarding@resend.dev>',
      to: email,
      subject: 'Your Full Report is Ready!',
      html: `
        <h1>Thank You for Your Purchase!</h1>
        <p>Your Full Report is now ready to view.</p>
        
        <h2>Purchase Details:</h2>
        <ul>
          <li>Item: Detailed Moral Analysis Report</li>
          <li>Amount: $14.99</li>
        </ul>

        <p>Access your report here:</p>
        <p><a href="${reportUrl}">View Your Full Report</a></p>

        ${isGuest ? `
          <hr/>
          <h3>Create Your Account</h3>
          <p>Create an account to access exclusive features and save your results:</p>
          <p><a href="${signupUrl}">Create Your Account</a></p>
          <p>Note: This report access link will expire in 7 days. Create an account to maintain permanent access to your report.</p>
        ` : ''}
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error sending results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
