
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ResultsHeader } from "./results/ResultsHeader";
import { CharacteristicsList } from "./results/CharacteristicsList";
import { PricingSection } from "./results/PricingSection";

interface ResultsProps {
  personalityType: string;
  session: any;
}

export const Results = ({ personalityType, session }: ResultsProps) => {
  const navigate = useNavigate();

  const keyCharacteristics = [
    "Strong survival instincts",
    "Reactive decision-making",
    "Basic needs focus"
  ];

  const unlockFeatures = [
    "Detailed personality breakdown",
    "Personal growth roadmap",
    "Expert recommendations"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-4xl w-full space-y-8">
        <Card className="border-2 border-primary/20">
          <ResultsHeader personalityType={personalityType} />
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <CharacteristicsList
                title="Key Characteristics"
                items={keyCharacteristics}
                icon="primary"
              />
              <CharacteristicsList
                title="Unlock Full Analysis"
                items={unlockFeatures}
                icon="secondary"
              />
            </div>
            <PricingSection session={session} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
