
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Brain, Target, Lightbulb, Zap } from "lucide-react";

export const HeroSection = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[80vh] bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70 flex items-center"
    >
      <div className="container mx-auto px-4 pt-16 pb-24 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
        >
          Discover Your Moral Development Level
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
        >
          Unlock insights about your ethical framework and elevate your leadership potential through our scientifically-backed assessment.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <Button 
            onClick={onStart}
            size="lg"
            className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 hover:text-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Start Free Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Trust Signals and Benefits */}
          <div className="max-w-2xl mx-auto">
            <p className="text-white text-lg md:text-xl font-medium mb-6">
              Join the community committed to being better today than they were yesterday.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-white text-left">Understand your unique moral perspective</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Target className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-white text-left">Set clear goals for personal growth</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Lightbulb className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-white text-left">Gain insights into your decision-making</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white flex-shrink-0" />
                <span className="text-white text-left">Enhance your leadership potential</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/90">
            {[
              "Scientific Assessment",
              "Instant Results",
              "Personal Insights"
            ].map((feature) => (
              <span key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="text-white h-5 w-5" />
                <span className="text-sm md:text-base">{feature}</span>
              </span>
            ))}
          </div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-sm md:text-base"
          >
            Join over 50,000+ individuals who have discovered their moral potential
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
    </motion.section>
  );
};
