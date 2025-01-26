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
    const { email, name, personalityType } = await req.json()
    console.log(`Sending results to ${name} (${email}) for personality type ${personalityType}`)

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

    const { data, error } = await resend.emails.send({
      from: 'Moral Hierarchy <onboarding@resend.dev>',
      to: [email],
      subject: `Your Level ${personalityType} Moral Analysis Results`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Moral Hierarchy Results</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f7;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="color: #1d1d1f; font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 24px;">
                  Hello ${name},
                </h1>
                
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">
                    Level ${personalityType}
                  </div>
                  <p style="color: #424245; font-size: 16px; line-height: 1.6; margin: 0;">
                    ${getLevelDescription(personalityType)}
                  </p>
                </div>

                <div style="background: #f5f5f7; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="color: #1d1d1f; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Key Characteristics</h2>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${getKeyCharacteristics(personalityType)
                      .map(char => `
                        <li style="color: #424245; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center;">
                          <span style="display: inline-block; width: 6px; height: 6px; background: #6366f1; border-radius: 50%; margin-right: 8px;"></span>
                          ${char}
                        </li>
                      `).join('')}
                  </ul>
                </div>

                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
                  <h2 style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 16px;">Unlock Your Complete Analysis</h2>
                  <p style="color: white; font-size: 16px; margin: 0 0 24px;">
                    Discover your full potential with our detailed report, including personalized growth strategies and comprehensive insights.
                  </p>
                  <a href="${Deno.env.get('PUBLIC_SITE_URL') || 'https://moralhierarchy.com'}/auth?redirect=/checkout" 
                     style="display: inline-block; background: white; color: #6366f1; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Get Your Full Report
                  </a>
                </div>

                <div style="text-align: center; color: #86868b; font-size: 12px;">
                  <p style="margin: 0;">
                    © ${new Date().getFullYear()} Moral Hierarchy. All rights reserved.
                  </p>
                </div>
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

const getKeyCharacteristics = (level: string): string[] => {
  switch (level) {
    case "1":
      return [
        "Focus on basic needs and survival",
        "Reactive decision-making",
        "Strong self-preservation instincts"
      ];
    case "2":
      return [
        "Pragmatic approach to decisions",
        "Understanding of societal rules",
        "Focus on personal success"
      ];
    case "3":
      return [
        "Emphasis on fairness and cooperation",
        "Strong sense of responsibility",
        "Value mutual benefit"
      ];
    case "4":
      return [
        "Strong sense of justice",
        "Balance rights with responsibilities",
        "Focus on accountability"
      ];
    case "5":
      return [
        "Deep emotional understanding",
        "Strong relational awareness",
        "Guided by empathy"
      ];
    case "6":
      return [
        "Selfless decision-making",
        "Focus on others' well-being",
        "Willing to sacrifice for greater good"
      ];
    case "7":
      return [
        "Strong moral principles",
        "Consistent ethical framework",
        "Integrity in action"
      ];
    case "8":
      return [
        "Natural moral excellence",
        "Inspiring through example",
        "Balance of wisdom and virtue"
      ];
    case "9":
      return [
        "Alignment with universal truths",
        "Transcendent perspective",
        "Legacy of positive impact"
      ];
    default:
      return [
        "Developing moral awareness",
        "Building ethical framework",
        "Growing in understanding"
      ];
  }
};