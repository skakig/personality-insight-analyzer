import { CalendarDays, CheckCircle } from "lucide-react";
import { CardHeader } from "@/components/ui/card";

interface CardHeaderProps {
  personalityType: string;
  createdAt: string;
  isDetailed: boolean;
}

export const AssessmentCardHeader = ({ personalityType, createdAt, isDetailed }: CardHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary/80">The Moral Hierarchy Results</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Level {personalityType}
            </h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 mr-1" />
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        {isDetailed ? (
          <CheckCircle className="h-5 w-5 text-primary" />
        ) : null}
      </div>
    </CardHeader>
  );
};