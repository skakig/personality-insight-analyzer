import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicResults } from "./results/BasicResults";
import { DetailedReportFeatures } from "./results/DetailedReportFeatures";
import { PurchaseSection } from "./results/PurchaseSection";

interface ResultsProps {
  personalityType: string;
  onPurchase: () => void;
  session: any;
}

export const Results = ({ personalityType, onPurchase, session }: ResultsProps) => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-4xl w-full space-y-8">
        <BasicResults 
          personalityType={personalityType} 
          getLevelDescription={getLevelDescription}
        />

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Unlock Your Complete Moral Profile
            </CardTitle>
            <CardDescription className="text-lg">
              Discover the depths of your moral development with our comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DetailedReportFeatures />
            <PurchaseSection session={session} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};