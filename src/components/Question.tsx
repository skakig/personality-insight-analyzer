import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./quiz/ProgressBar";
import { QuestionHeader } from "./quiz/QuestionHeader";
import { AnswerOptions } from "./quiz/AnswerOptions";
import { QuestionExplanation } from "./quiz/QuestionExplanation";

interface QuestionProps {
  question: string;
  onAnswer: (value: number) => void;
  currentProgress: number;
  category?: string;
  subcategory?: string;
  explanation?: string;
}

export const Question = ({ 
  question, 
  onAnswer, 
  currentProgress,
  category,
  subcategory,
  explanation 
}: QuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <ProgressBar currentProgress={currentProgress} />
      
      <Card className="bg-white p-8 mb-8">
        <QuestionHeader 
          category={category}
          subcategory={subcategory}
          question={question}
        />
        
        <AnswerOptions onAnswer={onAnswer} />

        {explanation && (
          <QuestionExplanation explanation={explanation} />
        )}
      </Card>
    </motion.div>
  );
};