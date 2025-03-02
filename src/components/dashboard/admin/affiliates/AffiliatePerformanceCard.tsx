
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, DollarSign, Users } from "lucide-react";

export interface AffiliatePerformanceCardProps {
  statTitle: string;
  statValue: string;
  statDescription: string;
  iconName: string;
}

export function AffiliatePerformanceCard({ 
  statTitle, 
  statValue, 
  statDescription, 
  iconName 
}: AffiliatePerformanceCardProps) {
  const getIcon = () => {
    switch (iconName) {
      case "users":
        return <Users className="h-6 w-6 text-primary" />;
      case "dollar":
        return <DollarSign className="h-6 w-6 text-green-500" />;
      case "chart":
        return <BarChart className="h-6 w-6 text-blue-500" />;
      default:
        return <Users className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{statTitle}</p>
            <p className="text-2xl font-bold">{statValue}</p>
            <p className="text-xs text-gray-500 mt-1">{statDescription}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-full">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
