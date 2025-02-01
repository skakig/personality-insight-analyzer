import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, ChartBar } from "lucide-react";

export const TeamAssessmentTools = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Team Assessment Tools</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Manage Teams</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Create and manage your teams, invite members, and track their progress.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/teams")}
            >
              View Teams
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Team Assessment</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Conduct moral hierarchy assessments for your entire team.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/team-assessment")}
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              <div className="flex items-center space-x-2">
                <ChartBar className="h-5 w-5 text-primary" />
                <span>Analytics</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              View detailed analytics and insights about your team's moral development.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/team-analytics")}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};