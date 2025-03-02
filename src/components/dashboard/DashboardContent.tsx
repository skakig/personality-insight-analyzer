
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

  // Check if user is admin to show admin panel
  const isAdmin = session?.user?.id === '32adf500-c102-4b14-a6a4-f8aa38f337c6';

  const handleUnlockReport = async (reportId: string) => {
    if (purchaseLoading) return;
    
    setPurchaseLoading(reportId);
    try {
      console.log('Initiating report unlock for:', reportId);
      
      if (!session?.user?.id) {
        throw new Error('You must be logged in to purchase reports');
      }
      
      // Ensure the report is associated with the user
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ 
          user_id: session.user.id,
          purchase_status: 'pending'
        })
        .eq('id', reportId);
        
      if (updateError) {
        console.error('Error linking report to user:', updateError);
      }
      
      // Create checkout session for this specific report
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          resultId: reportId,
          userId: session.user.id,
          email: session.user.email,
          newsletterOptIn: localStorage.getItem('newsletterOptIn') === 'true',
          metadata: {
            resultId: reportId,
            userId: session.user.id,
            email: session.user.email,
            newsletterOptIn: localStorage.getItem('newsletterOptIn') === 'true',
            returnUrl: `${window.location.origin}/dashboard?success=true`
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
        localStorage.setItem('purchaseResultId', reportId);
        localStorage.setItem('stripeSessionId', data.sessionId);
        
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
          
        console.log('Stored purchase data:', { 
          reportId, 
          sessionId: data.sessionId,
          userId: session.user.id
        });
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
        
        {/* Show admin panel if user is admin */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-medium mb-4">Admin Tools</h3>
            <p className="text-sm text-gray-600 mb-4">
              Access administrative tools and settings.
            </p>
            <Button
              onClick={() => navigate('/admin')}
              className="w-full"
              variant="outline"
            >
              Go to Admin Panel
            </Button>
          </div>
        )}
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
          <div className="mb-2">
            <label className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary focus:ring-primary"
                onChange={(e) => localStorage.setItem('newsletterOptIn', e.target.checked.toString())}
                defaultChecked={localStorage.getItem('newsletterOptIn') === 'true'}
              />
              <span>Subscribe to our newsletter</span>
            </label>
          </div>
          <PurchaseCreditsButton />
        </div>
      </div>
    </div>
  );
};
