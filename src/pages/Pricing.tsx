import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const pricingPlans = [
  {
    name: "Basic",
    price: "$49",
    description: "Perfect for small teams",
    features: ["Up to 10 assessments/month", "Basic analytics", "Email support"],
    priceId: "price_1Qlc4VJy5TVq3Z9H0PFhn9hs"
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing organizations",
    features: ["Up to 50 assessments/month", "Advanced analytics", "Priority support"],
    priceId: "price_1Qlc65Jy5TVq3Z9Hq6w7xhSm"
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For large enterprises",
    features: ["Unlimited assessments", "Custom analytics", "24/7 support"],
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
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your organization's needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">{plan.price}</span>
                /month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className="w-full"
              >
                {loading === plan.priceId ? "Loading..." : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Pricing;