import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/@resend/node@0.16.0";

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
    const { email, personalityType, analysis, scores } = await req.json();

    if (!email || !personalityType) {
      throw new Error('Missing required fields');
    }

    const scoresList = scores ? Object.entries(scores)
      .map(([category, score]) => `${category}: ${score}`)
      .join('\n') : 'No detailed scores available';

    const emailHtml = `
      <h1>Your Detailed Moral Development Report</h1>
      <h2>Personality Type: ${personalityType}</h2>
      
      <h3>Category Scores:</h3>
      <pre>${scoresList}</pre>
      
      <h3>Detailed Analysis:</h3>
      <p>${analysis || 'No detailed analysis available'}</p>
      
      <p>Thank you for using our platform to explore your moral development journey!</p>
    `;

    const data = await resend.emails.send({
      from: 'Moral Development <reports@moraldevelopment.app>',
      to: email,
      subject: `Your Level ${personalityType} Detailed Report`,
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});