
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "The Moral Hierarchy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to The Moral Hierarchy Community!",
      html: `
        <h1>Welcome to The Moral Hierarchy!</h1>
        <p>Thank you for joining our community dedicated to moral growth and development.</p>
        <p>You'll receive exclusive insights, updates, and opportunities to enhance your moral understanding.</p>
        <p>Stay tuned for our upcoming content and feel free to take our moral assessment test to begin your journey.</p>
        <p>Best regards,<br>The Moral Hierarchy Team</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
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
