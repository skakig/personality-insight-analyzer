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
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent gradient-bg leading-tight">
          Unlock Your True Potential Through Self-Discovery
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Join millions who have found clarity and purpose through our scientifically-backed personality assessment. 
          Discover your unique traits, strengths, and opportunities for growth.
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