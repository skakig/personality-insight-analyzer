import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const WelcomePage = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center gradient-bg"
    >
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
          The Moral Hierarchy
        </h1>
        <p className="text-lg md:text-xl text-gray-100 mb-8 opacity-90">
          Discover where you stand in the moral spectrum through our comprehensive assessment. 
          Take the free test now and unlock insights about your ethical framework.
        </p>
        <Button 
          onClick={onStart}
          className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Start Free Test
        </Button>
      </div>
    </motion.div>
  );
};