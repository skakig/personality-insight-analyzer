
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

interface CouponStatsProps {
  statTitle: string;
  statValue: string;
  statDescription: string;
  trend?: "up" | "down" | "neutral";
}

export function CouponStats({ statTitle, statValue, statDescription, trend = "neutral" }: CouponStatsProps) {
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
            {trend === "up" && <ArrowUpIcon className="h-5 w-5 text-green-500" />}
            {trend === "down" && <ArrowDownIcon className="h-5 w-5 text-red-500" />}
            {trend === "neutral" && <ArrowRightIcon className="h-5 w-5 text-gray-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
