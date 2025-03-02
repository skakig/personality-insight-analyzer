
import { AlertCircle } from "lucide-react";

interface DashboardErrorProps {
  error: string;
}

export const DashboardError = ({ error }: DashboardErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-2">
      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-medium">Error loading dashboard</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    </div>
  );
};
