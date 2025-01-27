import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getLevelDescription } from "./utils";
import { AssessmentCardHeader } from "./CardHeader";
import { DetailedReport } from "@/components/results/DetailedReport";
import { PurchaseSection } from "./PurchaseSection";
import { GrowthPotential } from "./GrowthPotential";
import { HighlightSection } from "./HighlightSection";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

interface AssessmentCardProps {
  result: {
    id: string;
    personality_type: string;
    created_at: string;
    detailed_analysis: string | null;
    is_detailed: boolean;
    is_purchased: boolean;
    category_scores: Record<string, number> | null;
    access_method: string | null;
  };
}

export const AssessmentCard = ({ result }: AssessmentCardProps) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: subscriptionData } = await supabase
          .from('corporate_subscriptions')
          .select('*')
          .eq('organization_id', session.user.id)
          .eq('active', true)
          .maybeSingle();
        
        setSubscription(subscriptionData);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, []);

  // Check if the user can access the detailed report
  const canAccessReport = result.is_purchased || 
    result.access_method === 'purchase' || 
    (subscription?.active && subscription?.assessments_used < subscription?.max_assessments);

  const handleViewReport = () => {
    navigate(`/assessment/${result.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-100 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
        <AssessmentCardHeader 
          personalityType={result.personality_type}
          createdAt={result.created_at}
          isDetailed={result.is_detailed}
        />
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <HighlightSection level={result.personality_type} />
            
            <div className="space-y-2">
              <p className="text-gray-600 leading-relaxed">
                {getLevelDescription(result.personality_type)}
              </p>
              
              <GrowthPotential level={result.personality_type} />
            </div>
          </div>
          
          {canAccessReport ? (
            <Button
              onClick={handleViewReport}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
          ) : (
            <PurchaseSection 
              resultId={result.id} 
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};