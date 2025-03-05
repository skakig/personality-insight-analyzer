
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ThumbsUp, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const BookPurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [purchaseVerified, setPurchaseVerified] = useState(false);
  const sessionId = searchParams.get('session_id');

  // Levels data with more detailed information
  const levels = [
    {
      level: 1,
      title: "Self-Preservation",
      subtitle: "Survival Morality",
      description: "At the base of the hierarchy, the instinct for survival takes precedence. Decisions are guided by basic survival instincts, and the world is viewed through the lens of personal security and self-interest.",
      key_traits: ["Focus on meeting basic needs", "Short-term thinking", "Reactive decision-making"],
      color: "from-red-50 to-red-100 border-red-200"
    },
    {
      level: 2,
      title: "Self-Interest",
      subtitle: "Pragmatic Morality",
      description: "Beyond survival comes the need for personal gain, comfort, and success. Choices are driven by what benefits the self in the material world, but still within a context of societal rules and norms.",
      key_traits: ["Strategic decision-making", "Focus on personal success", "Following rules when beneficial"],
      color: "from-orange-50 to-orange-100 border-orange-200"
    },
    {
      level: 3,
      title: "Social Contract",
      subtitle: "Cooperative Morality",
      description: "As humans interact, we begin to form mutual agreements about how to live together peacefully. The focus shifts to rules, responsibilities, and the importance of cooperation.",
      key_traits: ["Valuing cooperation", "Understanding mutual benefit", "Respecting societal norms"],
      color: "from-amber-50 to-amber-100 border-amber-200"
    },
    {
      level: 4,
      title: "Fairness",
      subtitle: "Justice Morality",
      description: "At this level, the concept of fairness comes into play. Questions of equity, justice, and balancing the rights of individuals arise. Decisions reflect a deeper concern for how to achieve fairness in the world.",
      key_traits: ["Concern for justice", "Recognition of equality", "Standing up for what's right"],
      color: "from-yellow-50 to-yellow-100 border-yellow-200"
    },
    {
      level: 5,
      title: "Empathy",
      subtitle: "Relational Morality",
      description: "Empathy guides our decisions as we seek to understand others' feelings and perspectives. Compassion and understanding become the driving force, even at the expense of our own interests.",
      key_traits: ["Understanding others' feelings", "Prioritizing relationships", "Emotional awareness"],
      color: "from-lime-50 to-lime-100 border-lime-200"
    },
    {
      level: 6,
      title: "Altruism",
      subtitle: "Sacrificial Morality",
      description: "At this stage, the idea of self-sacrifice emerges. The value of putting others' needs ahead of our own, sometimes at great personal cost, becomes a defining principle.",
      key_traits: ["Willingness to sacrifice", "Serving others' needs", "Finding joy in giving"],
      color: "from-green-50 to-green-100 border-green-200"
    },
    {
      level: 7,
      title: "Integrity",
      subtitle: "Principled Morality",
      description: "Integrity involves aligning our decisions with a set of personal principles, even when doing so isn't easy or advantageous. Moral actions are rooted in truth, honesty, and authenticity.",
      key_traits: ["Consistency in values", "Moral courage", "Living authentically"],
      color: "from-teal-50 to-teal-100 border-teal-200"
    },
    {
      level: 8,
      title: "Virtue",
      subtitle: "Aspiring Morality",
      description: "Virtue is about transcending the need for self-interest or sacrifice. It is a pursuit of moral excellence, where decisions are guided by a deep, intrinsic understanding of what it means to live a good life.",
      key_traits: ["Cultivation of character", "Balance of wisdom and compassion", "Habitual goodness"],
      color: "from-cyan-50 to-cyan-100 border-cyan-200"
    },
    {
      level: 9,
      title: "Self-Actualization",
      subtitle: "Transcendent Morality",
      description: "At the pinnacle of the hierarchy lies self-actualization—the realization of one's fullest potential. At this stage, moral choices are driven not by external circumstances or personal gain, but by a sense of alignment with a higher purpose and universal truth.",
      key_traits: ["Alignment with universal principles", "Effortless moral action", "Living as an example"],
      color: "from-blue-50 to-blue-100 border-blue-200"
    }
  ];

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Verify the purchase using Supabase
        const { data, error } = await supabase.functions.invoke('verify-book-purchase', {
          method: 'POST',
          body: { sessionId }
        });

        if (error) {
          console.error('Error verifying purchase:', error);
          toast({
            title: "Verification Error",
            description: "We couldn't verify your purchase. Please contact support.",
            variant: "destructive",
          });
        } else if (data?.verified) {
          setPurchaseVerified(true);
          toast({
            title: "Purchase Verified!",
            description: "Thank you for pre-ordering The Moral Hierarchy book.",
          });
        }
      } catch (error) {
        console.error('Purchase verification failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPurchase();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex justify-center items-center rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Thank You for Pre-Ordering!</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your pre-order of "The Moral Hierarchy" has been confirmed. We'll notify you when the book is ready for delivery.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button className="gap-2" onClick={() => window.location.href = "/"}>
            <BookOpen size={18} />
            Explore More
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/dashboard"}>
            <ThumbsUp size={18} />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>

      {/* Deeper Insight into The Moral Hierarchy */}
      <div className="mb-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Your Journey Through The Moral Hierarchy
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 text-center"
        >
          The Moral Hierarchy is a transformative framework that maps the evolution of human morality across nine distinct levels. Your pre-ordered book will guide you through each level in detail, helping you understand where you are and how to advance.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`overflow-hidden border h-full bg-gradient-to-br ${level.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-bold mr-3 shrink-0">
                      {level.level}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">{level.title}</h3>
                      <p className="text-sm text-gray-600">{level.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{level.description}</p>
                  <div className="mb-2 text-sm font-semibold">Key Traits:</div>
                  <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                    {level.key_traits.map((trait, i) => (
                      <li key={i}>{trait}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What's Next Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        className="bg-gray-50 rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          While you await your book, consider taking our moral assessment to discover your current moral level and receive personalized insights into your moral development.
        </p>
        <Button className="gap-2" onClick={() => window.location.href = "/assessment"}>
          Take the Moral Assessment <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  );
};

export default BookPurchaseSuccess;
