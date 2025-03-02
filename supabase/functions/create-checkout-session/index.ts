
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get request data
    const { 
      resultId, 
      userId, 
      email, 
      priceAmount, 
      productType = "report",
      mode = "payment",
      couponCode,
      metadata = {} 
    } = await req.json();

    console.log("Create checkout session request received:", {
      resultId,
      email,
      userId,
      priceAmount,
      productType,
      mode,
      hasCouponCode: !!couponCode,
      timestamp: new Date().toISOString(),
    });

    // Validate input data
    if (!email && !userId) {
      console.error("Missing required data: email or userId");
      return new Response(
        JSON.stringify({
          error: "Missing required information: email or user ID is required"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let discountAmount = 0;
    let discountData = null;

    // Apply coupon if provided
    if (couponCode) {
      try {
        const { data: coupon, error: couponError } = await supabaseClient
          .from("coupons")
          .select("*")
          .eq("code", couponCode)
          .eq("is_active", true)
          .single();

        if (couponError || !coupon) {
          console.error("Coupon lookup error:", couponError);
        } else if (coupon) {
          if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            console.log("Coupon expired:", couponCode);
          } else if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            console.log("Coupon usage limit reached:", couponCode);
          } else {
            // Calculate discount based on discount type
            if (coupon.discount_type === "percentage") {
              discountAmount = Math.round(priceAmount * (coupon.discount_amount / 100));
            } else if (coupon.discount_type === "fixed") {
              discountAmount = coupon.discount_amount;
            }

            discountData = {
              amount: coupon.discount_amount,
              type: coupon.discount_type,
              code: coupon.code
            };

            console.log("Applied discount:", {
              code: couponCode,
              originalPrice: priceAmount,
              discountAmount,
              finalPrice: Math.max(0, priceAmount - discountAmount)
            });
          }
        }
      } catch (couponError) {
        console.error("Error processing coupon:", couponError);
        // Continue without applying coupon
      }
    }

    // Calculate final price after discount
    const finalPrice = Math.max(0, priceAmount - discountAmount);

    // Create stripe checkout session
    const product_data = {
      name: productType === "report" ? "The Moral Hierarchy Assessment" : "Detailed Analysis",
      description: "Full detailed personalized analysis"
    };

    const lineItems = [{
      price_data: {
        currency: "usd",
        unit_amount: finalPrice,
        product_data
      },
      quantity: 1
    }];

    // Include metadata for later verification
    const stripeMetadata = {
      resultId,
      userId: userId || "guest",
      couponApplied: couponCode || "none",
      ...metadata
    };

    // Create session with Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode,
      success_url: `${req.headers.get("origin")}/assessment/${resultId}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/assessment/${resultId}?success=false`,
      customer_email: email,
      metadata: stripeMetadata,
    });

    // Return checkout URL and other metadata
    const responseData = {
      url: session.url,
      sessionId: session.id,
      discountAmount
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Checkout session creation error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Error creating checkout session",
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
