
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    console.log(`Sending welcome email to ${email}`)

    const { data, error } = await resend.emails.send({
      from: 'The Moral Hierarchy <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to The Moral Hierarchy Community!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to The Moral Hierarchy</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #1d1d1f; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 24px;">
                  Welcome to The Moral Hierarchy!
                </h1>
                
                <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  Thank you for joining our community dedicated to moral growth and development.
                </p>

                <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  You'll receive exclusive insights, updates, and opportunities to enhance your moral understanding.
                </p>

                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                  <h2 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Start Your Journey Today</h2>
                  <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://moralhierarchy.com'}" 
                     style="display: inline-block; background: white; color: #6366f1; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Take the Assessment
                  </a>
                </div>

                <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                  Stay tuned for our upcoming content and feel free to reach out if you have any questions.
                </p>

                <div style="text-align: center; color: #86868b; font-size: 12px; margin-top: 32px;">
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} The Moral Hierarchy. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error)
      throw error
    }

    console.log('Welcome email sent successfully:', data)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
