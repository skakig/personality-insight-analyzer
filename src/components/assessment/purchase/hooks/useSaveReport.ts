
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSaveReport = (
  resultId: string,
  setPurchaseLoading: (loading: boolean) => void
) => {
  const handleSaveReport = async () => {
    try {
      setPurchaseLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { error } = await supabase
          .from('quiz_results')
          .update({ 
            user_id: session.user.id,
            temp_access_token: null,
            temp_access_expires_at: null 
          })
          .eq('id', resultId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your report has been saved to your account!",
        });
      } else {
        const returnUrl = `/assessment/${resultId}`;
        window.location.href = `/auth?returnTo=${encodeURIComponent(returnUrl)}`;
      }
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "Failed to save your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  return handleSaveReport;
};
