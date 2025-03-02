
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export interface HeroSectionProps {
  onPreOrder: () => void;
}

export const HeroSection = ({ onPreOrder }: HeroSectionProps) => {
  return (
    <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
          The Moral Hierarchy
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">
          A Groundbreaking Framework for Understanding and Developing Moral Leadership
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 md:mb-12 px-4">
          <Button 
            size="lg"
            onClick={onPreOrder}
            className="w-full md:w-auto text-base md:text-lg px-8 py-6 rounded-full bg-primary text-white hover:bg-primary/90 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Pre-order Now - $29.99
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="w-full md:w-auto text-base md:text-lg px-8 py-6 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Learn More
            <BookOpen className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-gray-600 px-4">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Early Bird Discount</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Exclusive Pre-launch Content</span>
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span className="text-sm md:text-base">Digital + Physical Copy</span>
          </span>
        </div>
      </motion.div>
    </section>
  );
};
