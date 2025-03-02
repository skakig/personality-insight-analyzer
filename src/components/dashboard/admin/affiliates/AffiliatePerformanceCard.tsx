
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, DollarSign, TrendingUp, BarChart3, ShoppingCart } from "lucide-react";

interface AffiliatePerformanceCardProps {
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
        return <Users className="h-5 w-5 text-blue-500" />;
      case "userCheck":
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case "dollarSign":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "trendingUp":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "barChart":
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case "shoppingCart":
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{statTitle}</p>
            <p className="text-2xl font-bold">{statValue}</p>
            <p className="text-xs text-gray-500 mt-1">{statDescription}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
