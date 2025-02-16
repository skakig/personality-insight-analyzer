
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Zap, ArrowRight } from "lucide-react";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Discover Your Moral Development Level
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Unlock insights about your ethical framework and elevate your leadership potential through our scientifically-backed assessment.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/test")}
            className="text-xl px-12 py-8 rounded-full bg-white text-primary hover:bg-white/90 hover:text-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Start Free Assessment
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          {/* Value Propositions */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            {[
              { icon: <Brain className="h-6 w-6" />, text: "Scientific Assessment" },
              { icon: <Zap className="h-6 w-6" />, text: "Instant Results" },
              { icon: <Lightbulb className="h-6 w-6" />, text: "Personal Insights" }
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full">
                {item.icon}
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-white/80">
            <p className="text-lg">Join over 50,000+ individuals who have discovered their moral potential</p>
          </div>
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
                },
                {
                  icon: Brain,
                  title: "Personality Blindsides",
                  description: "Identify hidden patterns that may be limiting your moral growth."
                },
                {
                  icon: Lightbulb,
                  title: "Why Improving Matters",
                  description: "Understand the profound impact of moral development on your life and leadership."
                },
                {
                  icon: Target,
                  title: "TMH Roadmap",
                  description: "Get a clear path for advancing through the nine levels of moral development."
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Take the first step towards understanding and improving your moral reasoning.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/test")}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Start Free Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
