
import { Rocket, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export interface QuickActionsCardProps {
  subscription: any;
  hasPurchasedReport: boolean;
  hasAvailableCredits: boolean;
}

export const QuickActionsCard = ({ 
  subscription, 
  hasPurchasedReport, 
  hasAvailableCredits 
}: QuickActionsCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Get started with these quick actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => navigate('/')}
        >
          <Rocket className="mr-2 h-4 w-4" />
          Take Assessment
        </Button>
        
        {hasPurchasedReport && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/assessments')}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        )}
        
        {subscription && subscription.active && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/teams')}
          >
            <Users className="mr-2 h-4 w-4" />
            Team Assessment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
