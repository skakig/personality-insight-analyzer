
import { Card } from "@/components/ui/card";
import { PurchaseCreditsButton } from "../subscription/PurchaseCreditsButton";
import { NewsletterOptIn } from "./NewsletterOptIn";

export const CreditsSection = () => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Additional Credits</h3>
      <p className="text-sm text-gray-600 mb-4">
        Purchase additional assessment credits to unlock detailed reports.
      </p>
      <div className="mb-2">
        <NewsletterOptIn />
      </div>
      <PurchaseCreditsButton />
    </div>
  );
};
