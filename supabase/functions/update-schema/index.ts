
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-deno-subhost',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Only proceed if the request is from an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized user');
    }
    
    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });
    if (!isAdmin) {
      throw new Error('User is not an admin');
    }

    console.log('Running database schema updates...');
    const migrations = [];

    // Update coupons table with applicable_products column
    try {
      migrations.push('Adding applicable_products to coupons');
      const { error: couponError } = await supabase.rpc('execute_sql', {
        sql: `
          ALTER TABLE IF EXISTS public.coupons 
          ADD COLUMN IF NOT EXISTS applicable_products text[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL;
        `
      });
      if (couponError) throw couponError;
    } catch (error) {
      migrations.push(`Error adding applicable_products: ${error.message}`);
    }

    // Create affiliates table if it doesn't exist
    try {
      migrations.push('Creating affiliates table');
      const { error: affiliatesError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.affiliates (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            name text NOT NULL,
            email text NOT NULL UNIQUE,
            code text NOT NULL UNIQUE,
            commission_rate numeric NOT NULL DEFAULT 0.10,
            earnings numeric NOT NULL DEFAULT 0,
            total_sales numeric NOT NULL DEFAULT 0,
            status text NOT NULL CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS public.affiliate_commission_tiers (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            min_sales numeric NOT NULL,
            max_sales numeric,
            commission_rate numeric NOT NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
          );

          ALTER TABLE public.coupon_usage
          ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES affiliates(id) ON DELETE SET NULL;

          -- Add updated_at trigger for affiliates
          CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = now();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS set_affiliate_updated_at ON public.affiliates;
          CREATE TRIGGER set_affiliate_updated_at
          BEFORE UPDATE ON public.affiliates
          FOR EACH ROW
          EXECUTE FUNCTION update_affiliate_updated_at();
          
          -- Add default commission tiers if they don't exist
          INSERT INTO public.affiliate_commission_tiers (min_sales, max_sales, commission_rate)
          SELECT 0, 1000, 0.10
          WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_commission_tiers LIMIT 1);
          
          INSERT INTO public.affiliate_commission_tiers (min_sales, max_sales, commission_rate)
          SELECT 1000, 5000, 0.15
          WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_commission_tiers WHERE min_sales = 1000);
          
          INSERT INTO public.affiliate_commission_tiers (min_sales, max_sales, commission_rate)
          SELECT 5000, 10000, 0.20
          WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_commission_tiers WHERE min_sales = 5000);
          
          INSERT INTO public.affiliate_commission_tiers (min_sales, max_sales, commission_rate)
          SELECT 10000, NULL, 0.25
          WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_commission_tiers WHERE min_sales = 10000);
        `
      });
      if (affiliatesError) throw affiliatesError;
    } catch (error) {
      migrations.push(`Error creating affiliates table: ${error.message}`);
    }

    console.log('Database schema updates completed');
    return new Response(
      JSON.stringify({ 
        success: true,
        migrations
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error updating schema:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
