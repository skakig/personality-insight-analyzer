import { BenefitItem } from "./BenefitItem";

export const BenefitsList = () => {
  const benefits = [
    {
      title: "Deep Personal Insights",
      description: "Understand your unique moral framework and decision-making patterns"
    },
    {
      title: "Growth Roadmap",
      description: "Get a personalized path to reaching your next moral level"
    },
    {
      title: "Practical Exercises",
      description: "Access targeted activities to strengthen your moral reasoning"
    }
  ];

  return (
    <div className="grid gap-3">
      {benefits.map((benefit) => (
        <BenefitItem
          key={benefit.title}
          title={benefit.title}
          description={benefit.description}
        />
      ))}
    </div>
  );
};