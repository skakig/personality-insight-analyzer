import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

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
    const { email, personalityType } = await req.json()
    console.log(`Sending results to ${email} for personality type ${personalityType}`)

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const { data, error } = await resend.emails.send({
      from: 'Moral Hierarchy <onboarding@resend.dev>',
      to: email,
      subject: `Your Moral Level: ${personalityType}`,
      html: `
        <h1>Your Basic Moral Level Results</h1>
        <p>Based on your responses, you are at Level ${personalityType} of the Moral Hierarchy.</p>
        <p>This is just a basic overview of your moral level. To get detailed insights about:</p>
        <ul>
          <li>Your strengths and growth areas</li>
          <li>Personalized development path</li>
          <li>Detailed analysis of your responses</li>
          <li>Actionable steps for moral growth</li>
        </ul>
        <p><a href="${Deno.env.get('PUBLIC_SITE_URL')}/auth">Sign in to purchase your full results</a></p>
        <p>Best regards,<br>The Moral Hierarchy Team</p>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully', data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})