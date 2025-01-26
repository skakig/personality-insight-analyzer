import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookLanding = () => {
  const navigate = useNavigate();

  const handlePreOrder = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to pre-order the book",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process pre-order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
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
              onClick={handlePreOrder}
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

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center mb-12">Discover the Nine Levels of Moral Development</h2>
            <div className="space-y-8">
              {[
                {
                  level: "Level 1: Self-Preservation",
                  description: "Understanding survival morality and its impact on decision-making."
                },
                {
                  level: "Level 2: Self-Interest",
                  description: "Exploring pragmatic morality and personal success."
                },
                {
                  level: "Level 3: Social Contract",
                  description: "Building cooperative morality and mutual benefit."
                },
                {
                  level: "Level 4: Fairness",
                  description: "Developing justice-based moral reasoning."
                },
                {
                  level: "Level 5: Empathy",
                  description: "Cultivating relational morality and emotional connection."
                },
                {
                  level: "Level 6: Altruism",
                  description: "Embracing sacrificial morality for the greater good."
                },
                {
                  level: "Level 7: Integrity",
                  description: "Living with principled morality and authenticity."
                },
                {
                  level: "Level 8: Virtue",
                  description: "Aspiring to moral excellence and goodness."
                },
                {
                  level: "Level 9: Self-Actualization",
                  description: "Achieving transcendent morality and alignment with universal truths."
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-primary mb-2">{item.level}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-order Benefits Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-12">Pre-order Benefits</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Early Access",
                  description: "Get the book before the official release date"
                },
                {
                  title: "Exclusive Content",
                  description: "Access to pre-launch workshops and materials"
                },
                {
                  title: "Special Pricing",
                  description: "Save 25% off the regular retail price"
                }
              ].map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gray-50 rounded-xl"
                >
                  <h3 className="text-xl font-semibold mb-2 text-primary">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-12">Transform Your Leadership Journey</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                "Understand your current moral development level",
                "Learn strategies for advancing through each level",
                "Build stronger teams through moral leadership",
                "Make better decisions aligned with your values",
                "Develop lasting positive impact",
                "Create a culture of ethical excellence"
              ].map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 text-left"
                >
                  <CheckCircle2 className="text-primary flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-order CTA */}
      <section className="py-24 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Secure Your Copy Today</h2>
            <p className="text-xl mb-8 text-white/90">
              Pre-order now and receive exclusive access to supplementary materials and exercises.
            </p>
            <Button 
              size="lg"
              onClick={handlePreOrder}
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 transition-all duration-300"
            >
              Pre-order for $29.99
              <ArrowRight className="ml-2" />
            </Button>
            <p className="mt-6 text-white/80">
              Limited time offer - Price will increase after launch
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BookLanding;
