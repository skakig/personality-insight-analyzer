import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ResultsProps {
  personalityType: string;
  session: any;
}

export const Results = ({ personalityType, session }: ResultsProps) => {
  const navigate = useNavigate();

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

  const handlePurchase = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      console.log('Initiating checkout...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          userId: session.user.id,
          mode: 'subscription'
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Results Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-5xl font-bold">
              Your Moral Level:
              <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Level {personalityType}
              </span>
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              {getLevelDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Preview Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Key Characteristics
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Strong survival instincts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Reactive decision-making
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Basic needs focus
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-secondary" />
                  Unlock Full Analysis
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    Detailed personality breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    Personal growth roadmap
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    Expert recommendations
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 pt-6 border-t">
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  <span className="text-primary line-through opacity-75">$49.99</span>
                  <span className="ml-3">$29.99</span>
                </p>
                <p className="text-sm text-gray-500">Limited Time Offer</p>
              </div>
              
              <Button
                onClick={handlePurchase}
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity group"
              >
                {session ? (
                  <>
                    Unlock Your Full Report Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  "Sign In to Purchase"
                )}
              </Button>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  30-day money-back guarantee
                </p>
                <p className="text-xs text-gray-400">
                  Join thousands who have transformed their approach to ethical decision-making
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};