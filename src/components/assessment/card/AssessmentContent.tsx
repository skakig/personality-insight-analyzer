
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { HighlightSection } from "../HighlightSection";
import { GrowthPotential } from "../GrowthPotential";
import { PurchaseSection } from "../PurchaseSection";
import { getLevelDescription } from "../utils";

interface AssessmentContentProps {
  personalityType: string;
  canAccessReport: boolean;
  resultId: string;
  loading: boolean;
  onViewReport: () => void;
}

export const AssessmentContent = ({
  personalityType,
  canAccessReport,
  resultId,
  loading,
  onViewReport,
}: AssessmentContentProps) => {
  return (
    <CardContent className="space-y-6 p-6">
      <div className="space-y-4">
        <HighlightSection level={personalityType} />
        
        <div className="space-y-2">
          <p className="text-gray-600 leading-relaxed">
            {getLevelDescription(personalityType)}
          </p>
          
          <GrowthPotential level={personalityType} />
        </div>
      </div>
      
      {canAccessReport ? (
        <Button
          onClick={onViewReport}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
        >
          <FileText className="mr-2 h-4 w-4" />
          View Full Report
        </Button>
      ) : (
        <PurchaseSection 
          resultId={resultId} 
          loading={loading}
          priceId="price_1QloJQJy5TVq3Z9HTnIN6BX5" // Single assessment price
        />
      )}
    </CardContent>
  );
};
