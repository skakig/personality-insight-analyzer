import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const WelcomePage = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent gradient-bg">
          Discover Your True Personality
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Take our scientifically validated personality test and unlock insights about who you really are.
          Join millions of people who have discovered their true personality type.
        </p>
        <Button 
          onClick={onStart}
          className="text-lg px-8 py-6 rounded-full gradient-bg hover:opacity-90 transition-opacity"
        >
          Start Free Test
        </Button>
      </div>
    </motion.div>
  );
};