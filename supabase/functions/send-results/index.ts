import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, personalityType } = await req.json()
    console.log(`Sending results to ${email} for personality type ${personalityType}`)

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const getLevelDescription = (level: string) => {
      const descriptions: { [key: string]: string } = {
        "1": "You are currently focused on self-preservation and meeting basic needs. This stage is characterized by survival instincts and reactive decision-making.",
        "2": "Your moral framework centers on self-interest and pragmatic choices. You understand societal rules and follow them when beneficial.",
        "3": "You've developed a cooperative morality based on social contracts and mutual benefit. Fairness and responsibility guide your decisions.",
        "4": "Justice and accountability are central to your moral framework. You prioritize fairness and balance rights with responsibilities.",
        "5": "Your morality is deeply relational, guided by empathy and understanding of others' perspectives and needs.",
        "6": "You demonstrate sacrificial morality, often prioritizing others' well-being over your own comfort.",
        "7": "Your actions are guided by strong principles and integrity, maintaining consistency between values and behavior.",
        "8": "You embody virtue and excellence, with an intrinsic aspiration for moral and personal growth.",
        "9": "You've reached a level of transcendent morality, where actions align naturally with universal truths and higher purpose."
      };
      return descriptions[level] || "Your moral level indicates your current position in the journey of ethical development.";
    };

    const getKeyCharacteristics = (level: string) => {
      const characteristics: { [key: string]: string[] } = {
        "1": [
          "Focus on basic needs and survival",
          "Reactive decision-making",
          "Strong self-preservation instincts"
        ],
        "2": [
          "Pragmatic approach to decisions",
          "Understanding of societal rules",
          "Focus on personal success"
        ]
        // Add more levels as needed
      };
      return characteristics[level] || [
        "Developing moral awareness",
        "Building ethical framework",
        "Growing in understanding"
      ];
    };

    const { data, error } = await resend.emails.send({
      from: 'Moral Hierarchy <onboarding@resend.dev>',
      to: email,
      subject: `Your Moral Level ${personalityType} Results - Discover Your Path`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Moral Hierarchy Results</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1D1D1F; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F5F5F7;">
            <div style="background-color: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
              <h1 style="font-size: 28px; font-weight: 600; color: #1D1D1F; margin-bottom: 24px; text-align: center;">Your Moral Level: ${personalityType}</h1>
              
              <p style="font-size: 16px; color: #1D1D1F; margin-bottom: 24px; line-height: 1.6;">
                ${getLevelDescription(personalityType)}
              </p>

              <div style="background-color: #F5F5F7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight: 600; color: #1D1D1F; margin-bottom: 16px;">Key Characteristics</h2>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${getKeyCharacteristics(personalityType)
                    .map(char => `
                      <li style="margin-bottom: 12px; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 8px; height: 8px; background-color: #7C3AED; border-radius: 50%; margin-right: 12px;"></span>
                        ${char}
                      </li>
                    `).join('')}
                </ul>
              </div>

              <div style="text-align: center; padding: 32px 0; background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%); border-radius: 12px; margin-bottom: 24px;">
                <h2 style="color: white; font-size: 24px; font-weight: 600; margin-bottom: 16px;">Unlock Your Complete Analysis</h2>
                <p style="color: white; font-size: 16px; margin-bottom: 24px; padding: 0 24px;">
                  Discover your full potential with our detailed report, including personalized growth strategies and comprehensive insights.
                </p>
                <a href="${Deno.env.get('PUBLIC_SITE_URL')}/auth" 
                   style="display: inline-block; background-color: white; color: #7C3AED; padding: 16px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 16px; transition: all 0.2s ease;">
                  Get Your Full Report
                </a>
              </div>

              <div style="text-align: center; color: #6B7280; font-size: 14px;">
                <p style="margin-bottom: 12px;">
                  Your journey to moral growth starts here. Join thousands who have transformed their approach to ethical decision-making.
                </p>
                <p style="margin: 0;">
                  © ${new Date().getFullYear()} Moral Hierarchy. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
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