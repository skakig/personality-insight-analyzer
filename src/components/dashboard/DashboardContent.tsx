
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "./LoadingState";
import { RecentAssessmentsCard } from "./RecentAssessmentsCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { NoSubscriptionCard } from "./subscription/NoSubscriptionCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { Button } from "@/components/ui/button";
import { PurchaseCreditsButton } from "./subscription/PurchaseCreditsButton";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasAnyPurchasedReport } from "@/utils/purchaseUtils";
import { storePurchaseData } from "@/utils/purchaseStateUtils";
import { QuizResult } from "@/types/quiz";

interface DashboardContentProps {
  subscription: any;
  error: string | null;
  previousAssessments: QuizResult[];
  session: Session | null;
}

export const DashboardContent = ({
  subscription,
  error,
  previousAssessments,
  session
}: DashboardContentProps) => {
  const navigate = useNavigate();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error loading dashboard</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate if user has any purchased reports
  const hasPurchasedReport = previousAssessments.some(assessment => 
    assessment.is_purchased || assessment.is_detailed
  );
  
  // Calculate if user has available credits
  const hasAvailableCredits = subscription ? 
    subscription.assessments_used < subscription.max_assessments : false;

  const handleUnlockReport = async (reportId: string) => {
    if (purchaseLoading) return;
    
    setPurchaseLoading(reportId);
    try {
      console.log('Initiating report unlock for:', reportId);
      
      if (!session?.user?.id) {
        throw new Error('You must be logged in to purchase reports');
      }
      
      // Create checkout session for this specific report
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          resultId: reportId,
          userId: session.user.id,
          email: session.user.email,
          metadata: {
            resultId: reportId,
            userId: session.user.id,
            returnUrl: `${window.location.origin}/assessment/${reportId}?success=true`
          }
        }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL received');
      }
      
      // Store session data for verification
      if (data.sessionId) {
        storePurchaseData(reportId, data.sessionId, session.user.id);
        
        // Update result with session ID
        await supabase
          .from('quiz_results')
          .update({ 
            stripe_session_id: data.sessionId,
            user_id: session.user.id, // Ensure the user ID is set
            purchase_initiated_at: new Date().toISOString(),
            purchase_status: 'pending'
          })
          .eq('id', reportId);
      }
      
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error unlocking report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setPurchaseLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <RecentAssessmentsCard 
          assessments={previousAssessments}
          onUnlockReport={handleUnlockReport}
          purchaseLoading={purchaseLoading}
        />
      </div>
      <div className="space-y-6">
        <QuickActionsCard 
          subscription={subscription}
          hasPurchasedReport={hasPurchasedReport}
          hasAvailableCredits={hasAvailableCredits}
        />
        {subscription ? (
          <SubscriptionCard subscription={subscription} error={null} />
        ) : (
          <NoSubscriptionCard />
        )}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Additional Credits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Purchase additional assessment credits to unlock detailed reports.
          </p>
          <PurchaseCreditsButton />
        </div>
      </div>
    </div>
  );
};
