import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ReportHeaderProps {
  personalityType: string;
}

export const ReportHeader = ({ personalityType }: ReportHeaderProps) => {
  const getLevelDescription = (level: string): string => {
    const descriptions = {
      "1": "You are currently focused on self-preservation and meeting basic needs. This stage is characterized by survival instincts and reactive decision-making.",
      "2": "Your moral framework centers on self-interest and pragmatic choices. You understand societal rules and follow them when beneficial.",
      "3": "You've developed a cooperative morality based on social contracts and mutual benefit. Fairness and responsibility guide your decisions.",
      "4": "Justice and accountability are central to your moral framework. You prioritize fairness and balance rights with responsibilities.",
      "5": "Your morality is deeply relational, guided by empathy and understanding of others' perspectives and needs.",
      "6": "You demonstrate sacrificial morality, often prioritizing others' well-being over your own comfort.",
      "7": "Your actions are guided by strong principles and integrity, maintaining consistency between values and behavior.",
      "8": "You embody virtue and excellence, with an intrinsic aspiration for moral and personal growth.",
      "9": "You've reached a level of transcendent morality, where actions align naturally with universal truths and higher purpose."
    };
    return descriptions[level as keyof typeof descriptions] || 
      "Your moral level indicates your current position in the journey of ethical development.";
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Moral Level Assessment",
          text: `I've discovered I'm at Level ${personalityType} in my moral development journey. Check out your own level!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `I've discovered I'm at Level ${personalityType} in my moral development journey. Check out your own level at ${window.location.href}`
        );
        toast({
          title: "Link copied!",
          description: "Share the link with your friends.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center space-y-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">
          Level {personalityType}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {getLevelDescription(personalityType)}
        </p>
      </motion.div>
      
      <Button
        onClick={handleShare}
        variant="outline"
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share Results
      </Button>
    </div>
  );
};