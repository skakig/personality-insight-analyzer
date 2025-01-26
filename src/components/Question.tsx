import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const options = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

interface QuestionProps {
  question: string;
  onAnswer: (value: number) => void;
  currentProgress: number;
}

export const Question = ({ question, onAnswer, currentProgress }: QuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div 
          className="h-full gradient-bg rounded-full transition-all duration-300"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl md:text-2xl font-medium mb-12 text-center">
          {question}
        </h2>
        
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between text-sm text-gray-600 px-4">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
          
          <div className="flex justify-between items-center gap-2 px-4">
            {options.map((option) => (
              <div key={option.value} className="flex flex-col items-center gap-2">
                <Button
                  onClick={() => onAnswer(option.value)}
                  variant="outline"
                  className="w-12 h-12 rounded-full hover:bg-primary hover:text-white transition-all p-0"
                >
                  {option.value}
                </Button>
                <span className="text-xs text-gray-500 text-center hidden md:block">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};