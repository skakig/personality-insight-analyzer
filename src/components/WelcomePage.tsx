
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const WelcomePage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with gradient background */}
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
          >
            <Button 
              onClick={onStart}
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/90"
          >
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
          </motion.div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
      </motion.section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Why Understanding Your Moral Level Matters</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Enhanced Decision Making",
                  description: "Make better choices aligned with your values and principles."
                },
                {
                  title: "Leadership Growth",
                  description: "Develop stronger leadership skills through moral clarity."
                },
                {
                  title: "Personal Development",
                  description: "Understand yourself better and grow intentionally."
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Take the first step towards understanding and improving your moral development level.
            </p>
            <Button 
              onClick={onStart}
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
