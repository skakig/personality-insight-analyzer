
import { motion } from "framer-motion";
import { Brain, Target, Lightbulb } from "lucide-react";

export const WhatYoullLearn = () => {
  return (
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
  );
};
