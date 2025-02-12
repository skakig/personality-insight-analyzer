
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleRegularPurchase(session: any) {
  const accessMethod = session.metadata?.accessMethod;
  const resultId = session.metadata?.resultId;
  const isGift = session.metadata?.isGift === 'true';
  const giftRecipientEmail = session.metadata?.giftRecipientEmail;

  if (!resultId) return;

  const { data: quizResult } = await supabaseAdmin
    .from('quiz_results')
    .select('personality_type, category_scores, detailed_analysis')
    .eq('id', resultId)
    .single();

  if (!quizResult) {
    throw new Error('Quiz result not found');
  }

  if (isGift && giftRecipientEmail) {
    await handleGiftPurchase(quizResult, session.id, giftRecipientEmail);
  } else {
    await updateExistingResult(resultId, accessMethod, session.id);
  }
}

async function handleGiftPurchase(quizResult: any, sessionId: string, giftRecipientEmail: string) {
  const { data: giftResult, error: giftError } = await supabaseAdmin
    .from('quiz_results')
    .insert({
      personality_type: quizResult.personality_type,
      category_scores: quizResult.category_scores,
      detailed_analysis: quizResult.detailed_analysis,
      is_purchased: true,
      is_detailed: true,
      access_method: 'gift',
      stripe_session_id: sessionId
    })
    .select()
    .single();

  if (giftError) {
    console.error('Error creating gift result:', giftError);
    throw giftError;
  }

  await sendGiftEmail(giftRecipientEmail, quizResult, giftResult.id);
}

async function updateExistingResult(resultId: string, accessMethod: string, sessionId: string) {
  const { error: updateError } = await supabaseAdmin
    .from('quiz_results')
    .update({
      is_purchased: true,
      is_detailed: true,
      access_method: accessMethod,
      stripe_session_id: sessionId
    })
    .eq('id', resultId);

  if (updateError) {
    console.error('Error updating quiz result:', updateError);
    throw updateError;
  }
}

async function sendGiftEmail(email: string, quizResult: any, giftCode: string) {
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
      giftCode
    }),
  });

  if (!emailResponse.ok) {
    console.error('Error sending gift email:', await emailResponse.text());
    throw new Error('Failed to send gift email');
  }
}
