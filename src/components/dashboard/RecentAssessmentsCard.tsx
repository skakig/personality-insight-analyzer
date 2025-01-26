import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AssessmentCard } from "@/components/assessment/AssessmentCard";

interface RecentAssessmentsCardProps {
  assessments: Array<{
    id: string;
    personality_type: string;
    created_at: string;
    detailed_analysis: string | null;
    is_detailed: boolean;
    is_purchased: boolean;
    category_scores: Record<string, number> | null;
  }>;
}

export const RecentAssessmentsCard = ({ assessments }: RecentAssessmentsCardProps) => {
  const navigate = useNavigate();

  if (assessments.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium">Recent Assessments</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Your latest assessment results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {assessments.slice(0, 3).map((result) => (
          <AssessmentCard key={result.id} result={result} />
        ))}
        {assessments.length > 3 && (
          <Button 
            variant="outline" 
            className="w-full border border-gray-200 hover:bg-gray-50/50"
            onClick={() => navigate("/assessment-history")}
          >
            View All Assessments
          </Button>
        )}
      </CardContent>
    </Card>
  );
};