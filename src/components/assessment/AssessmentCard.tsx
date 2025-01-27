import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AssessmentCardHeader } from "./CardHeader";
import { AssessmentContent } from "./card/AssessmentContent";

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
        <AssessmentContent 
          personalityType={result.personality_type}
          canAccessReport={canAccessReport}
          resultId={result.id}
          loading={loading}
          onViewReport={handleViewReport}
        />
      </Card>
    </motion.div>
  );
};