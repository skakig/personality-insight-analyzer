
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleRegularPurchase } from "./regular-purchase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    console.log('Received webhook:', payload);

    // Extract session data
    const session = payload.data.object;
    console.log('Session data:', session);

    if (payload.type === 'checkout.session.completed') {
      console.log('Processing completed checkout session');
      return await handleRegularPurchase(session);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
