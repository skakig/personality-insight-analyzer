import { CheckCircle } from "lucide-react";

interface BenefitItemProps {
  title: string;
  description: string;
}

export const BenefitItem = ({ title, description }: BenefitItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};