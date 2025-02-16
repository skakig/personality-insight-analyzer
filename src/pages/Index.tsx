
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Target, Lightbulb, Zap } from "lucide-react";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 gradient-bg text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Moral Level
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Understand where you stand in the moral hierarchy and learn how to advance to higher levels of ethical development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/test")}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Take the Test
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/book")}
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
          
          {/* Value Propositions */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: <Brain className="h-5 w-5" />, text: "Scientific Assessment" },
              { icon: <Zap className="h-5 w-5" />, text: "Instant Results" },
              { icon: <Lightbulb className="h-5 w-5" />, text: "Personal Insights" }
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white/90 text-sm md:text-base bg-white/10 px-4 py-2 rounded-full">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-8 text-white/80">
          <p>Join over 50,000+ individuals who have discovered their moral potential</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Take the Moral Level Test?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Self-Understanding</h3>
              <p className="text-gray-600">
                Gain deep insights into your moral reasoning and ethical decision-making process.
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Growth Path</h3>
              <p className="text-gray-600">
                Discover concrete steps to advance to higher levels of moral development.
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600">
                Connect with others on similar moral development journeys.
              </p>
            </div>
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
            Start Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
