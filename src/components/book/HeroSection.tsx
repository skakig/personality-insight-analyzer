import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onPreOrder: () => void;
}

export const HeroSection = ({ onPreOrder }: HeroSectionProps) => {
  return (
    <section className="container mx-auto px-4 pt-20 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          The Moral Hierarchy
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          A Groundbreaking Framework for Understanding and Developing Moral Leadership
        </p>
        <div className="flex items-center justify-center gap-4 mb-12">
          <Button 
            size="lg"
            onClick={onPreOrder}
            className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
          >
            Pre-order Now - $29.99
            <ArrowRight className="ml-2" />
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 rounded-full hover:bg-gray-50"
          >
            Learn More
            <BookOpen className="ml-2" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Early Bird Discount
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Exclusive Pre-launch Content
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Digital + Physical Copy
          </span>
        </div>
      </motion.div>
    </section>
  );
};