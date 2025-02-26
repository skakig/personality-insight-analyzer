
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
