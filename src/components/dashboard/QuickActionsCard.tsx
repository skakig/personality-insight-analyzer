import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChartBar, History, FileText } from "lucide-react";

interface QuickActionsCardProps {
  subscription: {
    active: boolean;
    assessments_used: number;
    max_assessments: number;
  } | null;
  hasPurchasedReport: boolean;
  hasAvailableCredits: boolean;
}

export const QuickActionsCard = ({ 
  subscription, 
  hasPurchasedReport,
  hasAvailableCredits 
}: QuickActionsCardProps) => {
  const navigate = useNavigate();

  const isButtonDisabled = !subscription?.active && !hasPurchasedReport && !hasAvailableCredits;
  const buttonHelpText = !subscription?.active 
    ? hasPurchasedReport 
      ? "View your purchased assessment"
      : "Subscribe or purchase individual assessment"
    : !hasAvailableCredits 
      ? "Purchase more credits"
      : "Start a new evaluation";

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium">Quick Actions</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Manage your assessments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full h-auto py-4 px-4 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm"
          onClick={() => navigate("/dashboard/quiz")}
          disabled={isButtonDisabled}
        >
          <div className="flex items-center space-x-3">
            <ChartBar className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Take Assessment</div>
              <div className="text-xs opacity-90">
                {buttonHelpText}
              </div>
            </div>
          </div>
        </Button>
        
        {hasPurchasedReport ? (
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 px-4 border border-gray-200 hover:bg-gray-50/50"
            onClick={() => navigate("/assessment-history")}
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Your Full Report</div>
                <div className="text-xs text-gray-600">Access your detailed analysis</div>
              </div>
            </div>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 px-4 border border-gray-200 hover:bg-gray-50/50"
            onClick={() => navigate("/assessment-history")}
          >
            <div className="flex items-center space-x-3">
              <History className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View History</div>
                <div className="text-xs text-gray-600">See past results</div>
              </div>
            </div>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};