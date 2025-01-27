import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, personalityType, analysis, scores } = await req.json();
    console.log(`Sending detailed report to ${email} for personality type ${personalityType}`);

    const { data, error } = await resend.emails.send({
      from: "Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: `Your Level ${personalityType} Detailed Analysis`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Your Detailed Moral Analysis</title>
          </head>
          <body style="font-family: system-ui, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0;">Level ${personalityType}</h1>
              <p style="opacity: 0.9;">Your Detailed Moral Analysis</p>
            </div>

            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h2 style="color: #1e293b; margin-top: 0;">Detailed Analysis</h2>
              <p style="color: #475569;">${analysis}</p>
            </div>

            <div style="background: #f8fafc; padding: 24px; border-radius: 12px;">
              <h2 style="color: #1e293b; margin-top: 0;">Category Scores</h2>
              ${Object.entries(scores)
                .map(
                  ([category, score]) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #475569;">${category}</span>
                  <span style="font-weight: 500; color: #1e293b;">${score}</span>
                </div>
              `
                )
                .join("")}
            </div>

            <div style="text-align: center; margin-top: 32px; color: #64748b; font-size: 14px;">
              <p>This report was generated based on your assessment responses.</p>
              <p>© ${new Date().getFullYear()} Moral Hierarchy. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});