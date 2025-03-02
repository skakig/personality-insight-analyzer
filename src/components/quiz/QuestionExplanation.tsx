
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface QuestionExplanationProps {
  explanation?: string;
  level?: number;
}

export const QuestionExplanation = ({ explanation, level }: QuestionExplanationProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Default explanations based on moral hierarchy level if no specific explanation is provided
  const getDefaultExplanation = (level: number) => {
    switch(level) {
      case 1:
        return "This question assesses your level of Self-Preservation (Survival Morality). At this level, decisions are guided by basic survival instincts, and the world is viewed through the lens of personal security and self-interest.";
      case 2:
        return "This question evaluates your level of Self-Interest (Pragmatic Morality). Beyond survival, this level focuses on personal gain, comfort, and success within societal norms.";
      case 3:
        return "This question measures your understanding of Social Contract (Cooperative Morality). This level involves forming mutual agreements about living together peacefully, with a focus on rules, responsibilities, and cooperation.";
      case 4:
        return "This question examines your sense of Fairness (Justice Morality). At this level, concepts of equity, justice, and balancing individual rights come into play in decision-making.";
      case 5:
        return "This question explores your capacity for Empathy (Relational Morality). This level is guided by understanding others' feelings and perspectives, with compassion often taking precedence over self-interest.";
      case 6:
        return "This question assesses your tendency toward Altruism (Sacrificial Morality). This level involves self-sacrifice and putting others' needs ahead of your own, sometimes at great personal cost.";
      case 7:
        return "This question evaluates your Integrity (Principled Morality). This level involves aligning decisions with personal principles even when doing so isn't easy or advantageous.";
      case 8:
        return "This question measures your pursuit of Virtue (Aspiring Morality). This level transcends self-interest or sacrifice for a pursuit of moral excellence and living a good life.";
      case 9:
        return "This question examines your Self-Actualization (Transcendent Morality). This highest level represents alignment with higher purpose and universal truth in moral decision-making.";
      default:
        return "This question helps assess your position on the Moral Hierarchy, which ranges from basic survival considerations to transcendent moral principles.";
    }
  };

  const displayExplanation = explanation || (level ? getDefaultExplanation(level) : "This question helps assess your moral perspective based on where you fall on the Moral Hierarchy scale.");

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
          {displayExplanation}
        </motion.p>
      )}
    </div>
  );
};
