
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingPlan } from "@/components/pricing/PricingPlan";

const pricingPlans = [
  {
    name: "Individual",
    price: "$14.99",
    description: "Perfect for personal growth",
    features: [
      "Full personality assessment",
      "Detailed analysis report",
      "Personal growth recommendations",
      "Email support"
    ],
    priceId: "price_1QloJQJy5TVq3Z9HTnIN6BX5",
    paymentType: "payment" as const
  },
  {
    name: "Pro",
    price: "$99.99",
    description: "For growing organizations",
    features: [
      "Everything in Individual, plus:",
      "Team assessment tools",
      "Advanced analytics dashboard",
      "Priority support",
      "Custom report branding"
    ],
    priceId: "price_1QnmsaJy5TVq3Z9HpNI2p8xI",
    paymentType: "subscription" as const,
    highlight: true
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For large enterprises",
    features: [
      "Everything in Pro, plus:",
      "Unlimited team members",
      "API access",
      "Dedicated account manager",
      "Custom integration options",
      "24/7 phone support"
    ],
    priceId: "price_1Qlc6YJy5TVq3Z9Hya2ukkhJ",
    paymentType: "subscription" as const
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");

  const handleSubscribe = async (priceId: string, paymentType: "payment" | "subscription" = "subscription") => {
    setLoading(priceId);
    try {
      let response;
      
      // Use different endpoints for one-time payments vs subscriptions
      if (paymentType === "payment") {
        response = await supabase.functions.invoke('create-checkout-session', {
          body: { 
            resultId: null, // No specific result ID for general purchase
            mode: 'payment',
            priceAmount: 1499,
            metadata: {
              isGuest: true
            }
          }
        });
      } else {
        console.log('Creating subscription with:', { priceId, paymentType });
        response = await supabase.functions.invoke('create-subscription', {
          body: { 
            priceId,
            mode: paymentType,
            metadata: {
              isGuest: true
            }
          }
        });
      }

      console.log('Checkout response:', response);

      if (response.error) {
        console.error('Checkout error:', response.error);
        throw new Error(response.error.message || 'Failed to create checkout session');
      }
      
      if (!response.data?.url) {
        console.error('No checkout URL in response:', response);
        throw new Error('No checkout URL received');
      }

      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <PricingHeader />
      
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <PricingPlan
            key={plan.name}
            {...plan}
            loading={loading}
            onSubscribe={() => handleSubscribe(plan.priceId, plan.paymentType)}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-600">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
