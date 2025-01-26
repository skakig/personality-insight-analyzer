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
    "Detailed analysis of your moral development stage",
    "Personalized growth recommendations",
    "Strengths and areas for improvement",
    "Practical exercises for moral development",
    "Comparison with population averages",
    "Action plan for advancing to the next level"
  ];

  const reportBenefits = [
    "Understand your moral decision-making patterns",
    "Identify barriers to moral growth",
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