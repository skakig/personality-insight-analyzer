import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ResultsProps {
  personalityType: string;
  onPurchase: () => void;
}

export const Results = ({ personalityType, onPurchase }: ResultsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Your Personality Type:
          <span className="block text-5xl md:text-6xl mt-4 bg-clip-text text-transparent gradient-bg">
            {personalityType}
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          You've completed the test! Your personality type indicates you're a natural
          {personalityType.includes('I') ? ' introvert' : ' extrovert'} with unique traits
          that make you special.
        </p>

        <Button
          onClick={onPurchase}
          className="text-lg px-8 py-6 rounded-full gradient-bg hover:opacity-90 transition-opacity"
        >
          Save Results
        </Button>
      </div>
    </motion.div>
  );
};