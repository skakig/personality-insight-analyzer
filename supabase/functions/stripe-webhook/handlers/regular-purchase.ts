
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleRegularPurchase(session: any) {
  console.log('Starting regular purchase handler with session:', {
    id: session.id,
    metadata: session.metadata,
    timestamp: new Date().toISOString()
  });

  const resultId = session.metadata?.resultId;
  if (!resultId) {
    console.error('No resultId found in session metadata');
    throw new Error('No resultId found in session metadata');
  }

  console.log('Updating quiz result:', {
    resultId,
    sessionId: session.id,
    timestamp: new Date().toISOString()
  });

  // Update the quiz result
  const { error: updateError } = await supabaseAdmin
    .from('quiz_results')
    .update({
      is_purchased: true,
      is_detailed: true,
      access_method: 'purchase',
      stripe_session_id: session.id
    })
    .eq('id', resultId);

  if (updateError) {
    console.error('Error updating quiz result:', {
      error: updateError,
      resultId,
      sessionId: session.id,
      timestamp: new Date().toISOString()
    });
    throw updateError;
  }

  console.log('Successfully updated quiz result:', {
    resultId,
    sessionId: session.id,
    timestamp: new Date().toISOString()
  });

  // If it's a gift purchase, handle that separately
  if (session.metadata?.isGift === 'true' && session.metadata?.giftRecipientEmail) {
    await handleGiftPurchase(resultId, session.id, session.metadata.giftRecipientEmail);
  }
}

async function handleGiftPurchase(originalResultId: string, sessionId: string, giftRecipientEmail: string) {
  console.log('Processing gift purchase:', {
    originalResultId,
    sessionId,
    giftRecipientEmail,
    timestamp: new Date().toISOString()
  });

  // Get the original result data
  const { data: originalResult, error: fetchError } = await supabaseAdmin
    .from('quiz_results')
    .select('*')
    .eq('id', originalResultId)
    .single();

  if (fetchError || !originalResult) {
    console.error('Error fetching original result:', {
      error: fetchError,
      originalResultId,
      timestamp: new Date().toISOString()
    });
    throw fetchError || new Error('Original result not found');
  }

  // Create a new result for the gift recipient
  const { data: giftResult, error: insertError } = await supabaseAdmin
    .from('quiz_results')
    .insert({
      personality_type: originalResult.personality_type,
      category_scores: originalResult.category_scores,
      detailed_analysis: originalResult.detailed_analysis,
      is_purchased: true,
      is_detailed: true,
      access_method: 'gift',
      stripe_session_id: sessionId,
      answers: originalResult.answers
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating gift result:', {
      error: insertError,
      originalResultId,
      timestamp: new Date().toISOString()
    });
    throw insertError;
  }

  // Send the gift email
  try {
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-detailed-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        email: giftRecipientEmail,
        personalityType: originalResult.personality_type,
        analysis: originalResult.detailed_analysis,
        scores: originalResult.category_scores,
        resultId: giftResult.id
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send gift email');
    }
  } catch (error) {
    console.error('Error sending gift email:', {
      error,
      giftRecipientEmail,
      timestamp: new Date().toISOString()
    });
    // Don't throw here - the purchase was successful even if email fails
  }
}
