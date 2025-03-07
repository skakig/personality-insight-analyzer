import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BasicResultsProps {
  personalityType: string;
  getLevelDescription: () => string;
}

export const BasicResults = ({ personalityType, getLevelDescription }: BasicResultsProps) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const resultId = localStorage.getItem('guestQuizResultId');
      const accessToken = localStorage.getItem('guestAccessToken');

      if (!resultId || !accessToken) {
        throw new Error('No guest result found');
      }

      // Update the quiz result with guest email
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ guest_email: email })
        .eq('id', resultId)
        .eq('temp_access_token', accessToken);

      if (updateError) throw updateError;

      // Create temporary access token
      const { error: tokenError } = await supabase
        .from('temp_access_tokens')
        .insert({
          token: accessToken,
          email: email,
          result_id: resultId
        });

      if (tokenError) throw tokenError;

      // Send results email
      const { data, error } = await supabase.functions.invoke('send-results', {
        body: {
          email,
          name,
          personalityType,
        },
      });

      if (error) throw error;

      toast({
        title: "Results Sent!",
        description: "Check your email for your basic personality insights.",
      });
      setEmail("");
      setName("");
    } catch (error: any) {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-8 text-center"
    >
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Key Characteristics</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {getKeyCharacteristics(personalityType).map((trait, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Growth Opportunities</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {getGrowthOpportunities(personalityType).map((opportunity, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4 mt-8">
          <div className="flex flex-col space-y-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white"
            />
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={isSending}
            className="w-full max-w-md"
          >
            {isSending ? "Sending..." : "Get Basic Results"}
          </Button>
          <p className="text-xs text-gray-500">
            Save your results and create an account later to access your full history
          </p>
        </form>
      </div>
    </motion.div>
  );
};

const getKeyCharacteristics = (level: string): string[] => {
  switch (level) {
    case "1":
      return [
        "Focus on basic needs and survival",
        "Reactive decision-making",
        "Strong self-preservation instincts"
      ];
    case "2":
      return [
        "Pragmatic approach to decisions",
        "Understanding of societal rules",
        "Focus on personal success"
      ];
    // ... Add cases for levels 3-9
    default:
      return [
        "Developing moral awareness",
        "Building ethical framework",
        "Growing in understanding"
      ];
  }
};

const getGrowthOpportunities = (level: string): string[] => {
  switch (level) {
    case "1":
      return [
        "Develop long-term thinking",
        "Build trust in others",
        "Move beyond survival mode"
      ];
    case "2":
      return [
        "Consider broader impacts",
        "Develop empathy",
        "Build meaningful relationships"
      ];
    // ... Add cases for levels 3-9
    default:
      return [
        "Explore moral principles",
        "Practice ethical decision-making",
        "Engage in self-reflection"
      ];
  }
};
