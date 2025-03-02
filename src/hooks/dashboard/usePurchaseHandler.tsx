
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const usePurchaseHandler = (session: Session | null, refreshData: () => Promise<void>) => {
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  
  const handleSuccessfulPurchase = async () => {
    try {
      // Get the result ID from localStorage
      const resultId = localStorage.getItem('purchaseResultId') || localStorage.getItem('checkoutResultId');
      const sessionId = localStorage.getItem('stripeSessionId') || localStorage.getItem('creditsPurchaseSessionId');
      
      if (resultId && sessionId && session?.user?.id) {
        console.log('Confirming purchase for result:', resultId);
        
        // First check if the result already exists and is linked to this user
        const { data: existingResult } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', resultId)
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        // Update the result to mark it as purchased
        await supabase
          .from('quiz_results')
          .update({
            is_purchased: true,
            is_detailed: true,
            purchase_status: 'completed',
            purchase_completed_at: new Date().toISOString(),
            access_method: 'purchase',
            user_id: session.user.id, // Ensure the user ID is set
            stripe_session_id: sessionId // Make sure the session ID is set
          })
          .eq('id', resultId);
          
        console.log('Purchase confirmed for result:', resultId);
        
        // Show a success notification
        toast({
          title: "Purchase Successful",
          description: "Your full report is now available for viewing.",
        });
        
        // Clean up localStorage
        localStorage.removeItem('purchaseResultId');
        localStorage.removeItem('checkoutResultId');
        localStorage.removeItem('stripeSessionId');
        localStorage.removeItem('creditsPurchaseSessionId');
        
        // Refresh data to show updated purchases
        await refreshData();
      } else {
        console.log('Missing information for purchase confirmation:', { resultId, sessionId, userId: session?.user?.id });
      }
    } catch (error) {
      console.error('Error confirming purchase:', error);
    }
  };

  const handlePurchaseStatus = (success: string | null) => {
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
  };

  return {
    purchaseLoading,
    setPurchaseLoading,
    handleSuccessfulPurchase,
    handlePurchaseStatus
  };
};
