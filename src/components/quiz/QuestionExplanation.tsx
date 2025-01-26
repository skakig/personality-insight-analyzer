import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface QuestionExplanationProps {
  explanation: string;
}

export const QuestionExplanation = ({ explanation }: QuestionExplanationProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <Button
        variant="ghost"
        className="text-primary hover:text-primary/80"
        onClick={() => setShowExplanation(!showExplanation)}
      >
        {showExplanation ? "Hide" : "Show"} Explanation
      </Button>
      {showExplanation && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 text-gray-600 text-sm"
        >
          {explanation}
        </motion.p>
      )}
    </div>
  );
};