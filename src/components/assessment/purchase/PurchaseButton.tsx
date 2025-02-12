
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface PurchaseButtonProps {
  onClick: () => void;
  loading: boolean;
  isPurchased?: boolean;
  resultId?: string;
}

export const PurchaseButton = ({ onClick, loading, isPurchased, resultId }: PurchaseButtonProps) => {
  const navigate = useNavigate();

  const handlePurchase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          resultId,
          accessMethod: 'purchase'
        }),
      });

      const { url, error } = await response.json();
      
      if (error) throw new Error(error);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={isPurchased ? onClick : handlePurchase}
      disabled={loading}
      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        isPurchased ? "View Full Report" : "Unlock Full Report"
      )}
    </Button>
  );
};
