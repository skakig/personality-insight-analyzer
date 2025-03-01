
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ResultsHeader } from "./results/ResultsHeader";
import { CharacteristicsList } from "./results/CharacteristicsList";
import { PricingSection } from "./results/PricingSection";
import { useEffect, useState } from "react";

interface ResultsProps {
  personalityType: string;
  session: any;
  quizResultId: string | null; // Added quizResultId prop to fix the type error
}

export const Results = ({ personalityType, session, quizResultId }: ResultsProps) => {
  const navigate = useNavigate();
  const [localQuizResultId, setLocalQuizResultId] = useState<string | null>(quizResultId);

  useEffect(() => {
    // Get quiz result ID from localStorage for guest users
    if (!session?.user && !localQuizResultId) {
      const storedResultId = localStorage.getItem('guestQuizResultId');
      if (storedResultId) {
        setLocalQuizResultId(storedResultId);
      }
    }
  }, [session, localQuizResultId]);

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
            <PricingSection 
              session={session} 
              quizResultId={localQuizResultId || quizResultId}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
