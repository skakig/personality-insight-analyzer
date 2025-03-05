
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, resultId, isGuest } = await req.json();

    // Fetch the quiz result details
    const { data: result, error: resultError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (resultError) throw resultError;

    // Send the detailed report email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'The Moral Hierarchy <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Detailed Moral Hierarchy Analysis',
      html: `
        <h1>Your Detailed Moral Analysis Report</h1>
        <p>Dear ${name},</p>
        <p>Thank you for purchasing your detailed moral analysis report. Your insights are now available!</p>
        
        <h2>Your Results Overview</h2>
        <p>Moral Level: ${result.personality_type}</p>
        
        ${isGuest ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f7; border-radius: 8px;">
            <h3>Secure Your Report</h3>
            <p>To ensure you never lose access to your report and unlock additional features:</p>
            <p>
              <a href="${Deno.env.get('SITE_URL')}/assessment/${resultId}" 
                 style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Create Your Account
              </a>
            </p>
          </div>
        ` : ''}
        
        <p>Access your full report here:</p>
        <p>
          <a href="${Deno.env.get('SITE_URL')}/assessment/${resultId}"
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Full Report
          </a>
        </p>
        
        <p>Best regards,<br>The Moral Hierarchy Team</p>
      `,
    });

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error sending detailed report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
