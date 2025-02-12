
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleGuestPurchase(session: any) {
  const { data: guestPurchase, error: guestError } = await supabaseAdmin
    .from('guest_purchases')
    .update({ status: 'completed' })
    .eq('stripe_session_id', session.id)
    .select()
    .single();

  if (guestError) {
    console.error('Error updating guest purchase:', guestError);
    throw guestError;
  }

  if (guestPurchase?.result_id) {
    await updateQuizResult(guestPurchase.result_id);
    await sendDetailedReport(guestPurchase.result_id, guestPurchase.email);
  }
}

async function updateQuizResult(resultId: string) {
  const { error: updateError } = await supabaseAdmin
    .from('quiz_results')
    .update({
      is_purchased: true,
      is_detailed: true,
      access_method: 'guest_purchase'
    })
    .eq('id', resultId);

  if (updateError) {
    console.error('Error updating quiz result:', updateError);
    throw updateError;
  }
}

async function sendDetailedReport(resultId: string, email: string) {
  const { data: quizResult } = await supabaseAdmin
    .from('quiz_results')
    .select('personality_type, detailed_analysis, category_scores')
    .eq('id', resultId)
    .single();

  if (quizResult) {
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        email,
        personalityType: quizResult.personality_type,
        analysis: quizResult.detailed_analysis,
        scores: quizResult.category_scores,
        isPdf: true
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending email:', await emailResponse.text());
      throw new Error('Failed to send email');
    }
  }
}
