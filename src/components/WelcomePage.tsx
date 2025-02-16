
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Brain, Target, Lightbulb, Clock, FileText, Zap } from "lucide-react";

export const WelcomePage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[90vh] bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70 flex items-center"
      >
        <div className="container mx-auto px-4 pt-20 pb-32 text-center relative z-10">
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
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Trust Signals */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/90">
              {[
                "Scientific Assessment",
                "Instant Results",
                "Personal Insights"
              ].map((feature, index) => (
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

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "3-Minute Assessment",
                  description: "Quick, engaging questions designed to understand your moral framework."
                },
                {
                  icon: Zap,
                  title: "Instant Analysis",
                  description: "Get your results immediately with our AI-powered analysis."
                },
                {
                  icon: FileText,
                  title: "Detailed Insights",
                  description: "Receive a comprehensive report about your moral development level."
                }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center p-6"
                >
                  <step.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What You'll Learn</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Moral Strengths",
                  description: "Understand your unique moral capabilities and areas for growth."
                },
                {
                  icon: Target,
                  title: "Decision Making",
                  description: "Learn how to make better choices aligned with your values."
                },
                {
                  icon: Lightbulb,
                  title: "Leadership Path",
                  description: "Discover how to lead with greater moral clarity and purpose."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <item.icon className="w-12 h-12 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-white/90 mb-12">
              Take the first step towards understanding and improving your moral development level.
            </p>
            <div className="space-y-6">
              <Button 
                onClick={onStart}
                size="lg"
                className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-white/80 text-sm">Your data is private & secure</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
