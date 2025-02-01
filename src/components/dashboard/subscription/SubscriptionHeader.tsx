import { getSubscriptionTitle } from "@/utils/subscriptionUtils";
import { TeamAssessmentTools } from "@/components/teams/TeamAssessmentTools";

interface SubscriptionHeaderProps {
  subscriptionTier: string;
  isActive: boolean;
}

export const SubscriptionHeader = ({ subscriptionTier, isActive }: SubscriptionHeaderProps) => {
  return (
    <div className="p-6 space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight">
        {getSubscriptionTitle(subscriptionTier)}
      </h3>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <p className="text-sm text-gray-500">
          {isActive ? 'Active Subscription' : 'Inactive Subscription'}
        </p>
      </div>
      {subscriptionTier === 'pro' && (
        <div className="mt-4">
          <TeamAssessmentTools />
        </div>
      )}
    </div>
  );
};