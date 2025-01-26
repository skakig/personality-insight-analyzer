import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  personalityType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, personalityType }: EmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Personality Test <onboarding@resend.dev>",
      to: [email],
      subject: `Your Personality Type: ${personalityType}`,
      html: `
        <h1>Your Basic Personality Results</h1>
        <p>Based on your responses, your personality type is: <strong>${personalityType}</strong></p>
        <p>This is just a basic overview of your personality type. To get detailed insights about:</p>
        <ul>
          <li>Your strengths and weaknesses</li>
          <li>Career recommendations</li>
          <li>Relationship compatibility</li>
          <li>Personal growth opportunities</li>
        </ul>
        <p><a href="${Deno.env.get("PUBLIC_SITE_URL")}/auth">Sign in to purchase your full results</a></p>
        <p>Best regards,<br>Your Personality Test Team</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);