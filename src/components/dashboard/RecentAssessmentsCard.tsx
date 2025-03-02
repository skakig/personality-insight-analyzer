
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, FileText, LockOpen } from "lucide-react";
import { isPurchased } from "@/utils/purchaseStatus";
import { formatDistanceToNow } from "date-fns";
import { QuizResult } from "@/types/quiz";

interface RecentAssessmentsCardProps {
  assessments: QuizResult[];
  onUnlockReport: (reportId: string) => void;
  purchaseLoading: string | null;
}

export const RecentAssessmentsCard = ({ 
  assessments,
  onUnlockReport,
  purchaseLoading
}: RecentAssessmentsCardProps) => {
  const navigate = useNavigate();
  
  const handleViewReport = (id: string) => {
    navigate(`/assessment/${id}`);
  };

  if (!assessments.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-2">Recent Assessments</h3>
        <div className="py-10 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            You haven't taken any assessments yet.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
          >
            Take Assessment Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Recent Assessments</h3>
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div 
            key={assessment.id} 
            className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-base">Moral Hierarchy Assessment</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Taken {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                </p>
                {assessment.primary_level && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Level {assessment.primary_level}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-x-2 flex">
                {isPurchased(assessment) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(assessment.id)}
                  >
                    View Report
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onUnlockReport(assessment.id)}
                    disabled={purchaseLoading === assessment.id}
                  >
                    {purchaseLoading === assessment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <LockOpen className="mr-2 h-4 w-4" />
                        Unlock Report
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Take New Assessment
        </Button>
      </div>
    </Card>
  );
};
