import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AssessmentCardProps {
  result: {
    id: string;
    personality_type: string;
    created_at: string;
    detailed_analysis: string | null;
    is_detailed: boolean;
    is_purchased: boolean;
    category_scores: Record<string, number> | null;
    access_method: string | null;
  };
}

export const AssessmentCard = ({ result }: AssessmentCardProps) => {
  const navigate = useNavigate();
  const date = new Date(result.created_at).toLocaleDateString();
  const hasFullAccess = result.is_purchased || result.is_detailed;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Moral Level Assessment",
          text: `I've discovered I'm at Level ${result.personality_type} in my moral development journey. Check out your own level!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `I've discovered I'm at Level ${result.personality_type} in my moral development journey. Check out your own level at ${window.location.href}`
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
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              Level {result.personality_type}
            </h3>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-gray-500 hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => navigate(`/assessment/${result.id}`)}
          className={`w-full ${
            hasFullAccess
              ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText className="mr-2 h-4 w-4" />
          {hasFullAccess ? "View Your Report" : "Unlock Your Full Report"}
        </Button>
      </CardContent>
    </Card>
  );
};