import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getLevelDescription } from "@/components/assessment/utils";

interface ReportHeaderProps {
  personalityType: string;
}

export const ReportHeader = ({ personalityType }: ReportHeaderProps) => {
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
    <div className="bg-gradient-to-br from-gray-50 to-white pb-8">
      <div className="text-4xl font-bold text-center space-y-2">
        <span className="block text-gray-600">Your Moral Level</span>
        <span className="block text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Level {personalityType}
        </span>
      </div>
      <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
        {getLevelDescription(personalityType)}
      </p>
      <Button
        onClick={handleShare}
        className="mx-auto mt-4 bg-primary/10 text-primary hover:bg-primary/20"
        variant="ghost"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Results
      </Button>
    </div>
  );
};