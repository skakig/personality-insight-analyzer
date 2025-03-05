
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, resultId, adminId } = await req.json();
    
    console.log('Manual authorization request:', {
      email,
      resultId,
      adminId,
      timestamp: new Date().toISOString()
    });

    // Verify that the requester is an admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', {
      user_id: adminId
    });

    if (adminCheckError || !isAdmin) {
      console.error('Admin verification failed:', {
        error: adminCheckError,
        isAdmin,
        adminId
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Admin privileges required' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find the result by ID if provided
    if (resultId) {
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          access_method: 'manual_admin',
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString()
        })
        .eq('id', resultId)
        .select()
        .single();

      if (resultError) {
        console.error('Error updating result:', resultError);
        throw resultError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Assessment access granted successfully',
          result
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no resultId but email is provided, grant access to latest assessment for that email
    if (email) {
      // Find the latest assessment for this email
      const { data: latestResult, error: emailError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('guest_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (emailError) {
        console.error('Error finding assessment by email:', emailError);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No assessment found for this email' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update the result to provide access
      const { data: updatedResult, error: updateError } = await supabase
        .from('quiz_results')
        .update({
          is_purchased: true,
          is_detailed: true,
          access_method: 'manual_admin',
          purchase_status: 'completed',
          purchase_completed_at: new Date().toISOString()
        })
        .eq('id', latestResult.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating assessment access:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Assessment access granted successfully',
          result: updatedResult
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Either resultId or email must be provided' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in manual-authorize-assessment:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
