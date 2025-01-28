import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SubscriptionHeaderProps {
  subscriptionTier: string;
  isActive: boolean;
}

export const SubscriptionHeader = ({ subscriptionTier, isActive }: SubscriptionHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{subscriptionTier}</span>
        {isActive && (
          <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        )}
      </CardTitle>
      <CardDescription>
        Track your assessment credit usage
      </CardDescription>
    </CardHeader>
  );
};