
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
  analysis: string;
}

const handler = async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse request body
    const { email, personalityType, analysis }: EmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Sending detailed report to ${email}, level: ${personalityType}`);

    const levelNumber = personalityType.match(/\d+/)?.[0] || "";
    const levelName = personalityType.replace(/Level \d+: /, "");

    // Generate a better formatted email for the report
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #4f46e5; margin-bottom: 20px; }
          h2 { color: #4338ca; margin-top: 30px; margin-bottom: 15px; }
          .level-badge { display: inline-block; padding: 5px 10px; background-color: #4f46e5; color: white; border-radius: 15px; font-size: 14px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; padding: 20px; border-radius: 8px; background-color: #f9fafb; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Your Moral Hierarchy Report</h1>
        <p>Thank you for completing The Moral Hierarchy assessment. Here is your personalized report:</p>
        
        <div class="level-badge">Level ${levelNumber}: ${levelName}</div>
        
        <div class="section">
          <h2>Your Moral Development Level</h2>
          <p>${analysis}</p>
        </div>
        
        <div class="section">
          <h2>Next Steps on Your Journey</h2>
          <p>We recommend reviewing your full report online for detailed insights on:</p>
          <ul>
            <li>Your key strengths and success markers</li>
            <li>Areas for potential growth</li>
            <li>Strategies to overcome common challenges</li>
            <li>Personalized recommendations for moving to the next level</li>
          </ul>
        </div>
        
        <p>You can view your complete assessment results by logging into your account at <a href="https://themoralhierarchy.com">The Moral Hierarchy</a>.</p>
        
        <div class="footer">
          <p>This report is based on your responses to The Moral Hierarchy assessment.</p>
          <p>&copy; ${new Date().getFullYear()} The Moral Hierarchy. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Create a background task that won't block the response
    const sendEmailPromise = resend.emails.send({
      from: "The Moral Hierarchy <assessment@themoralhierarchy.com>",
      to: [email],
      subject: `Your Moral Hierarchy Report - Level ${levelNumber}: ${levelName}`,
      html: emailHtml,
    });

    // Use the waitUntil pattern to handle the background task properly in Deno runtime
    const handleBackgroundTasks = async () => {
      try {
        const result = await sendEmailPromise;
        console.log("Email sent successfully:", result);
      } catch (error) {
        console.error("Background email sending failed:", error);
      }
    };

    // Use EdgeRuntime.waitUntil if available, otherwise handle differently
    if (typeof EdgeRuntime !== 'undefined') {
      try {
        // @ts-ignore - EdgeRuntime is a global available in some Deno edge runtimes
        EdgeRuntime.waitUntil(handleBackgroundTasks());
      } catch (e) {
        // If EdgeRuntime.waitUntil is not available, we'll still try to run the task
        // but the function might terminate before it completes
        console.log("EdgeRuntime.waitUntil not available, running task without waiting");
        handleBackgroundTasks();
      }
    } else {
      // For environments without EdgeRuntime
      handleBackgroundTasks();
    }

    // Return success response immediately without waiting for email to send
    return new Response(
      JSON.stringify({ success: true, message: "Report email delivery initiated" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-detailed-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
