import { useNavigate } from "react-router-dom";
import { getSubscriptionTitle } from "@/utils/subscriptionUtils";

interface DashboardHeaderProps {
  subscription: any;
}

export const DashboardHeader = ({ subscription }: DashboardHeaderProps) => {
  return (
    <header className="space-y-1">
      <h1 className="text-4xl font-medium tracking-tight text-gray-900">
        {subscription ? getSubscriptionTitle(subscription.subscription_tier) : 'Dashboard'}
      </h1>
      <p className="text-lg text-gray-500">
        Track your progress and manage your assessments
      </p>
    </header>
  );
};