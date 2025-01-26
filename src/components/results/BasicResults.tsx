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

  return (
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
  );
};