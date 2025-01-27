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
    const { email, personalityType, analysis, scores } = await req.json();

    if (!email || !personalityType) {
      throw new Error('Missing required fields');
    }

    const scoresList = scores ? Object.entries(scores)
      .map(([category, score]) => `
        <div style="margin-bottom: 10px;">
          <strong>${category}:</strong> ${score}
        </div>
      `).join('') : 'No detailed scores available';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Detailed Moral Development Report</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f7;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1d1d1f; font-size: 24px; margin-bottom: 16px;">
                Your Level ${personalityType} Detailed Report
              </h1>
            </div>
            
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1d1d1f; font-size: 20px; margin-bottom: 16px;">Category Scores</h2>
              <div style="background: #f5f5f7; padding: 20px; border-radius: 12px;">
                ${scoresList}
              </div>
            </div>
            
            <div style="margin-bottom: 32px;">
              <h2 style="color: #1d1d1f; font-size: 20px; margin-bottom: 16px;">Detailed Analysis</h2>
              <div style="background: #f5f5f7; padding: 20px; border-radius: 12px;">
                <p style="margin: 0; color: #424245;">
                  ${analysis || 'No detailed analysis available'}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; color: #86868b; font-size: 12px; margin-top: 32px;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Moral Development Assessment. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: 'Moral Development <reports@moraldevelopment.app>',
      to: email,
      subject: `Your Level ${personalityType} Detailed Report`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', data);

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