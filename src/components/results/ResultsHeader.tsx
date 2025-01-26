import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ResultsHeaderProps {
  personalityType: string;
}

export const ResultsHeader = ({ personalityType }: ResultsHeaderProps) => {
  const getLevelDescription = () => {
    switch (personalityType) {
      case "1":
        return "You are currently focused on self-preservation and meeting basic needs. This level is characterized by survival instincts and reactive decision-making.";
      case "2":
        return "Your moral framework centers on self-interest and pragmatic choices. You understand societal rules and follow them when beneficial.";
      case "3":
        return "You've developed a cooperative morality based on social contracts and mutual benefit. Fairness and responsibility guide your decisions.";
      case "4":
        return "Justice and accountability are central to your moral framework. You prioritize fairness and balance rights with responsibilities.";
      case "5":
        return "Your morality is deeply relational, guided by empathy and understanding of others' perspectives and needs.";
      case "6":
        return "You demonstrate sacrificial morality, often prioritizing others' well-being over your own comfort.";
      case "7":
        return "Your actions are guided by strong principles and integrity, maintaining consistency between values and behavior.";
      case "8":
        return "You embody virtue and excellence, with an intrinsic aspiration for moral and personal growth.";
      case "9":
        return "You've reached a level of transcendent morality, where actions align naturally with universal truths and higher purpose.";
      default:
        return "Your moral level indicates your current position in the journey of ethical development.";
    }
  };

  return (
    <CardHeader className="text-center">
      <CardTitle className="text-4xl md:text-5xl font-bold">
        Your Moral Level:
        <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Level {personalityType}
        </span>
      </CardTitle>
      <CardDescription className="text-lg mt-4">
        {getLevelDescription()}
      </CardDescription>
    </CardHeader>
  );
};