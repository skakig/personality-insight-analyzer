
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { RecentAssessmentsCardProps } from "@/types/dashboard";
import { Lock, Unlock, ChevronRight } from "lucide-react";

export const RecentAssessmentsCard = ({ 
  assessments,
  subscription,
  hasAvailableCredits 
}: RecentAssessmentsCardProps) => {
  const navigate = useNavigate();

  const getButtonConfig = (assessment: any) => {
    const isPurchased = assessment.is_purchased || assessment.is_detailed || assessment.access_method === 'purchase';
    
    if (isPurchased) {
      return {
        label: "View Full Report",
        icon: <Unlock className="h-4 w-4 mr-2" />,
        variant: "default" as const,
        className: "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      };
    }
    
    if (!subscription?.active && !hasAvailableCredits) {
      return {
        label: "Unlock Full Report",
        icon: <Lock className="h-4 w-4 mr-2" />,
        variant: "outline" as const,
        className: "border-primary/20 text-primary hover:bg-primary/5 transition-colors"
      };
    }
    
    return {
      label: "View Report",
      icon: <ChevronRight className="h-4 w-4" />,
      variant: "outline" as const,
      className: "border-gray-200 hover:bg-gray-50/50 transition-colors"
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assessments.map((assessment) => {
          const buttonConfig = getButtonConfig(assessment);
          const isPurchased = assessment.is_purchased || assessment.is_detailed || assessment.access_method === 'purchase';
          
          return (
            <div
              key={assessment.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-gray-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    Level {assessment.personality_type}
                  </p>
                  {isPurchased && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      Purchased
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant={buttonConfig.variant}
                size="sm"
                onClick={() => navigate(`/assessment/${assessment.id}`)}
                disabled={!subscription?.active && !hasAvailableCredits && !isPurchased}
                className={buttonConfig.className}
              >
                {buttonConfig.icon}
                {buttonConfig.label}
              </Button>
            </div>
          );
        })}
        {assessments.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No assessments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
