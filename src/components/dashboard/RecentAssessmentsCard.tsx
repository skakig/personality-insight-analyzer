import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { RecentAssessmentsCardProps } from "@/types/dashboard";

export const RecentAssessmentsCard = ({ 
  assessments,
  subscription,
  hasAvailableCredits 
}: RecentAssessmentsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="space-y-1">
              <p className="font-medium">
                Level {assessment.personality_type}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/assessment/${assessment.id}`)}
              disabled={!subscription?.active || !hasAvailableCredits}
            >
              {assessment.is_purchased || assessment.is_detailed || assessment.access_method === 'purchase'
                ? "View Full Report"
                : "Unlock Full Report"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};