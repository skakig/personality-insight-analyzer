
import { motion } from "framer-motion";
import { Clock, Zap, FileText } from "lucide-react";

export const HowItWorks = () => {
  return (
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
                description: "Get your results immediately, based on the revolutionary The Moral Hierarchy Framework."
              },
              {
                icon: FileText,
                title: "Detailed Insights",
                description: "Receive a comprehensive report about your moral development level and a personalized roadmap for development."
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
  );
};
