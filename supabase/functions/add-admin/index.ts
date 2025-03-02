
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Predefined list of admin emails - update this list as needed
const adminEmails = [
  "skakig@gmail.com",
  // Add other admin emails as needed
];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running add-admin function");

    // Set up admin users for predefined list
    for (const email of adminEmails) {
      console.log(`Processing admin setup for: ${email}`);
      
      // Get user ID from email
      const { data: users, error: userError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (userError) {
        console.error(`Error finding user for email ${email}:`, userError);
        continue;
      }

      if (!users || users.length === 0) {
        console.log(`No user found with email: ${email}`);
        continue;
      }

      const userId = users[0].id;

      // Check if user is already an admin
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (adminCheckError) {
        console.error(`Error checking admin status for ${email}:`, adminCheckError);
        continue;
      }

      if (existingAdmin) {
        console.log(`User ${email} is already an admin, skipping`);
        continue;
      }

      // Add user as admin
      const { error: insertError } = await supabase
        .from("admin_users")
        .insert({ id: userId });

      if (insertError) {
        console.error(`Error adding admin for ${email}:`, insertError);
        continue;
      }

      console.log(`Successfully added ${email} as admin`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin setup completed",
        processed: adminEmails.length 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in add-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
