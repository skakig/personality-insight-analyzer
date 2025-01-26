import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      const response = await fetch('/api/send-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          personalityType,
        }),
      });

      if (!response.ok) throw new Error('Failed to send results');

      toast({
        title: "Results Sent!",
        description: "Check your email for your basic personality insights.",
      });
      setEmail("");
    } catch (error) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Your Moral Level:
          <span className="block text-5xl md:text-6xl mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Level {personalityType}
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          You're at Level {personalityType} of the Moral Hierarchy. Get your basic results by email or unlock detailed insights with our premium analysis.
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

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Want Detailed Insights?</h2>
            <Button
              onClick={handleGetDetailedResults}
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
            >
              {session ? "Purchase Full Analysis ($9.99)" : "Sign In to Purchase"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};