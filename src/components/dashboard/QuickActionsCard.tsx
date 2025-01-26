import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface QuickActionsCardProps {
  subscription: {
    active: boolean;
    assessments_used: number;
    max_assessments: number;
  } | null;
}

export const QuickActionsCard = ({ subscription }: QuickActionsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your assessments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full"
          onClick={() => navigate("/dashboard/quiz")}
          disabled={!subscription?.active || (subscription?.assessments_used >= subscription?.max_assessments)}
        >
          Take Assessment
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate("/assessment-history")}
        >
          View History
        </Button>
      </CardContent>
    </Card>
  );
};