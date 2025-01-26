import { CheckCircle2 } from "lucide-react";

interface FeatureListProps {
  features: string[];
  icon: "primary" | "secondary";
}

const FeatureList = ({ features, icon }: FeatureListProps) => (
  <ul className="space-y-3">
    {features.map((feature, index) => (
      <li key={index} className="flex items-center gap-2">
        <CheckCircle2 className={`h-5 w-5 text-${icon}`} />
        <span>{feature}</span>
      </li>
    ))}
  </ul>
);

export const DetailedReportFeatures = () => {
  const reportFeatures = [
    "Comprehensive analysis of your moral development stage",
    "Detailed breakdown of your scores across key categories",
    "Personalized growth recommendations",
    "Practical exercises for advancing to the next level",
    "Comparison with population averages",
    "Access to expert insights and development resources"
  ];

  const reportBenefits = [
    "Understand your decision-making patterns in depth",
    "Identify specific areas for moral growth",
    "Learn strategies for ethical leadership",
    "Develop stronger relationships through moral awareness",
    "Access exclusive development resources",
    "Receive ongoing support and guidance"
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Full Report Includes:</h3>
        <FeatureList features={reportFeatures} icon="primary" />
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Why Get the Full Report?</h3>
        <FeatureList features={reportBenefits} icon="secondary" />
      </div>
    </div>
  );
};