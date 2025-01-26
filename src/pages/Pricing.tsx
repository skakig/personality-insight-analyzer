import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Individual",
    price: "$9.99",
    description: "Perfect for personal growth",
    features: [
      "Full personality assessment",
      "Detailed analysis report",
      "Personal growth recommendations",
      "Email support"
    ],
    priceId: "price_1Qlc4VJy5TVq3Z9H0PFhn9hs"
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing organizations",
    features: [
      "Everything in Individual, plus:",
      "Team assessment tools",
      "Advanced analytics dashboard",
      "Priority support",
      "Custom report branding"
    ],
    priceId: "price_1Qlc65Jy5TVq3Z9Hq6w7xhSm",
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
    priceId: "price_1Qlc6YJy5TVq3Z9Hya2ukkhJ"
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");

  const handleSubscribe = async (priceId: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(priceId);
    try {
      const response = await supabase.functions.invoke('create-subscription', {
        body: { priceId },
      });

      if (response.error) throw response.error;
      if (!response.data?.url) throw new Error('No checkout URL received');

      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription process",
        variant: "destructive",
      });
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Choose Your Growth Path
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan to unlock your full potential and understand your moral development journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col relative ${
              plan.highlight 
                ? 'border-primary shadow-lg scale-105 z-10' 
                : 'border-gray-200'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full ${
                  plan.highlight 
                    ? 'bg-primary hover:bg-primary/90' 
                    : ''
                }`}
              >
                {loading === plan.priceId ? "Processing..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>
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