
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { toast } from "@/hooks/use-toast";

export interface DashboardProps {
  session: Session | null;
}

const Dashboard = ({ session }: DashboardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousAssessments, setPreviousAssessments] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      if (!session?.user?.id) {
        console.error('No user ID found in session:', session);
        setError('User session is invalid');
        return;
      }

      console.log('Fetching data for user:', session.user.id);

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('corporate_subscriptions')
        .select('*')
        .eq('organization_id', session.user.id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to load subscription data');
      } else {
        setSubscription(subscriptionData);
      }

      // Fetch previous assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('Error fetching assessments:', assessmentsError);
        setError('Failed to load assessment history');
      } else {
        setPreviousAssessments(assessments || []);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', {
        error: err,
        session: session,
        userId: session?.user?.id
      });
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulPurchase = async () => {
    try {
      // Get the result ID from localStorage
      const resultId = localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId');
      const sessionId = localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId');
      
      if (resultId && sessionId && session?.user?.id) {
        console.log('Confirming purchase for result:', resultId);
        
        // Update the result to mark it as purchased
        await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            user_id: session.user.id // Ensure the user ID is set
          })
          .eq('id', resultId);
          
        console.log('Purchase confirmed for result:', resultId);
        
        // Refresh data to show updated purchases
        await fetchData();
      }
    } catch (error) {
      console.error('Error confirming purchase:', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) {
      console.log('No valid session, redirecting to auth');
      navigate("/auth");
      return;
    }

    fetchData();

    // Set up real-time subscription for quiz_results
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_results',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          console.log('Quiz results updated, refreshing data...');
          fetchData();
        }
      )
      .subscribe();

    // Handle purchase success/failure notifications
    const success = searchParams.get('success');
    if (success === 'true') {
      toast({
        title: "Purchase Successful",
        description: "Your full report is now available.",
      });
      handleSuccessfulPurchase();
    } else if (success === 'false') {
      toast({
        title: "Purchase Cancelled",
        description: "Your purchase was not completed. Please try again if you'd like to unlock your full report.",
        variant: "destructive",
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, navigate, searchParams]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <DashboardHeader subscription={subscription} />
        <DashboardContent 
          subscription={subscription}
          error={error}
          previousAssessments={previousAssessments}
          session={session}
        />
      </div>
    </div>
  );
};

export default Dashboard;
