import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ResultsProps {
  personalityType: string;
  onPurchase: () => void;
  session: any;
}

export const Results = ({ personalityType, onPurchase, session }: ResultsProps) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-results', {
        body: {
          email,
          personalityType,
        },
      });

      if (error) throw error;

      toast({
        title: "Results Sent!",
        description: "Check your email for your basic personality insights.",
      });
      setEmail("");
    } catch (error) {
      console.error('Error sending results:', error);
      toast({
        title: "Error",
        description: "Failed to send results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGetDetailedResults = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLevelDescription = () => {
    switch (personalityType) {
      case "1":
        return "You are currently focused on self-preservation and meeting basic needs. This level is characterized by survival instincts and reactive decision-making.";
      case "2":
        return "Your moral framework centers on self-interest and pragmatic choices. You understand societal rules and follow them when beneficial.";
      case "3":
        return "You've developed a cooperative morality based on social contracts and mutual benefit. Fairness and responsibility guide your decisions.";
      case "4":
        return "Justice and accountability are central to your moral framework. You prioritize fairness and balance rights with responsibilities.";
      case "5":
        return "Your morality is deeply relational, guided by empathy and understanding of others' perspectives and needs.";
      case "6":
        return "You demonstrate sacrificial morality, often prioritizing others' well-being over your own comfort.";
      case "7":
        return "Your actions are guided by strong principles and integrity, maintaining consistency between values and behavior.";
      case "8":
        return "You embody virtue and excellence, with an intrinsic aspiration for moral and personal growth.";
      case "9":
        return "You've reached a level of transcendent morality, where actions align naturally with universal truths and higher purpose.";
      default:
        return "Your moral level indicates your current position in the journey of ethical development.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-4xl w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Your Moral Level:
            <span className="block text-5xl md:text-6xl mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Level {personalityType}
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {getLevelDescription()}
          </p>

          <div className="space-y-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email for basic results"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="max-w-md mx-auto"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isSending}
                className="w-full max-w-md"
              >
                {isSending ? "Sending..." : "Get Basic Results"}
              </Button>
            </form>
          </div>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Unlock Your Complete Moral Profile
            </CardTitle>
            <CardDescription className="text-lg">
              Discover the depths of your moral development with our comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Your Full Report Includes:</h3>
                <ul className="space-y-3">
                  {[
                    "Detailed analysis of your moral development stage",
                    "Personalized growth recommendations",
                    "Strengths and areas for improvement",
                    "Practical exercises for moral development",
                    "Comparison with population averages",
                    "Action plan for advancing to the next level"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Why Get the Full Report?</h3>
                <ul className="space-y-3">
                  {[
                    "Understand your moral decision-making patterns",
                    "Identify barriers to moral growth",
                    "Learn strategies for ethical leadership",
                    "Develop stronger relationships through moral awareness",
                    "Access exclusive development resources",
                    "Receive ongoing support and guidance"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-center pt-6">
              <p className="text-2xl font-bold mb-4">
                Special Introductory Price: <span className="text-primary">$9.99</span>
              </p>
              <Button
                onClick={handleGetDetailedResults}
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
              >
                {session ? "Get Your Full Report Now" : "Sign In to Purchase"}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                30-day money-back guarantee. Your growth journey starts here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};