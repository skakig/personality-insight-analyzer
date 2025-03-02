
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequestBody {
  email: string;
  resultId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resultId } = await req.json() as EmailRequestBody;
    
    if (!email || !resultId) {
      console.error("Missing required fields:", { email, resultId });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Processing email request:", { email, resultId });
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch the result data from the database
    const { data: result, error: resultError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .single();
      
    if (resultError || !result) {
      console.error("Error fetching result:", resultError);
      return new Response(
        JSON.stringify({ error: "Result not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get basic level description for the email
    const level = result.personality_type || result.primary_level;
    let levelDescription = "your moral hierarchy level";
    
    switch(level) {
      case "1":
        levelDescription = "Self-Preservation (Survival Morality)";
        break;
      case "2":
        levelDescription = "Self-Interest (Pragmatic Morality)";
        break;
      case "3":
        levelDescription = "Social Contract (Cooperative Morality)";
        break;
      case "4":
        levelDescription = "Fairness (Justice Morality)";
        break;
      case "5":
        levelDescription = "Empathy (Relational Morality)";
        break;
      case "6":
        levelDescription = "Altruism (Sacrificial Morality)";
        break;
      case "7":
        levelDescription = "Integrity (Principled Morality)";
        break;
      case "8":
        levelDescription = "Virtue (Aspiring Morality)";
        break;
      case "9":
        levelDescription = "Self-Actualization (Transcendent Morality)";
        break;
    }
    
    // Prepare result URL
    const resultUrl = `${req.headers.get('origin') || 'https://themoralhierarchy.com'}/assessment/${resultId}`;
    
    // Send the email with the results and receipt
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'The Moral Hierarchy <noreply@themoralhierarchy.com>',
      to: [email],
      subject: 'Your Moral Hierarchy Assessment Results',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center;">Your Moral Hierarchy Results</h1>
          
          <p>Thank you for completing your Moral Hierarchy assessment. We're excited to share your results with you!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #2563eb; margin-top: 0;">Your Level: ${level}</h2>
            <p>You are currently at <strong>${levelDescription}</strong>.</p>
          </div>
          
          <p>To view your complete detailed report, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resultUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Full Report</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3>Receipt Information</h3>
            <p>Order Date: ${new Date(result.purchase_completed_at || result.created_at).toLocaleDateString()}</p>
            <p>Product: Moral Hierarchy Detailed Assessment</p>
            <p>Amount: $${(result.purchase_amount ? result.purchase_amount / 100 : 14.99).toFixed(2)}</p>
          </div>
          
          <p style="margin-top: 40px; font-size: 14px; color: #6b7280; text-align: center;">
            &copy; ${new Date().getFullYear()} The Moral Hierarchy. All rights reserved.
          </p>
        </div>
      `,
    });
    
    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Email sent successfully:", emailResult);
    
    return new Response(
      JSON.stringify({ success: true, data: emailResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
