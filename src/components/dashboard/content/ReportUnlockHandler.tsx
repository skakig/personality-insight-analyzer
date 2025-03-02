
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportUnlockHandlerProps {
  session: Session | null;
  children: (props: { 
    purchaseLoading: string | null;
    handleUnlockReport: (reportId: string) => Promise<void>;
  }) => React.ReactNode;
}

export const ReportUnlockHandler = ({ session, children }: ReportUnlockHandlerProps) => {
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

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

  return <>{children({ purchaseLoading, handleUnlockReport })}</>;
};
