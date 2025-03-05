
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PricingPlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  loading: string;
  onSubscribe: () => void;
  priceId: string;
}

export const PricingPlan = ({
  name,
  price,
  description,
  features,
  highlight,
  loading,
  onSubscribe,
  priceId
}: PricingPlanProps) => {
  return (
    <div className={`rounded-xl p-8 ${highlight ? 'border-2 border-primary shadow-lg' : 'border border-gray-200'}`}>
      <h3 className="text-2xl font-bold mb-4">{name}</h3>
      <p className="text-4xl font-bold mb-6">{price}</p>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        onClick={onSubscribe}
        disabled={loading === priceId}
        className="w-full px-8 py-6 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
      >
        {loading === priceId ? "Processing..." : "Get Started"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};
