import { Progress } from "@/components/ui/progress";

interface SubscriptionProgressProps {
  usagePercentage: number;
  creditsRemaining: number;
  isLowOnCredits: boolean;
}

export const SubscriptionProgress = ({ 
  usagePercentage, 
  creditsRemaining, 
  isLowOnCredits 
}: SubscriptionProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Credits Used: {usagePercentage.toFixed(0)}%</span>
        <span>Credits Remaining: {creditsRemaining}</span>
      </div>
      <Progress 
        value={usagePercentage} 
        className={`h-2 ${isLowOnCredits ? 'bg-yellow-200' : ''}`}
      />
    </div>
  );
};