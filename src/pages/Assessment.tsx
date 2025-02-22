
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DetailedReport } from "@/components/results/DetailedReport";
import { toast } from "@/components/ui/use-toast";

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

const Assessment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!id || id === ':id?') {
          toast({
            title: "Invalid assessment ID",
            description: "Please check the URL and try again",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get current session and access token
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        const accessToken = searchParams.get('token');

        const isPostPurchase = searchParams.get('success') === 'true';
        const purchaseId = localStorage.getItem('currentPurchaseId');
        const storedResultId = localStorage.getItem('purchaseResultId');

        if (isPostPurchase && storedResultId && storedResultId !== id) {
          console.error('Result ID mismatch:', { stored: storedResultId, current: id });
          toast({
            title: "Error",
            description: "Invalid assessment result",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        let purchaseCompleted = false;
        if (isPostPurchase && purchaseId) {
          if (retryCount === 0) {
            toast({
              title: "Processing your purchase",
              description: "Please wait while we prepare your report...",
            });
          }

          const { data: purchaseData } = await supabase
            .from('purchase_tracking')
            .select('status')
            .eq('id', purchaseId)
            .single();
          
          purchaseCompleted = purchaseData?.status === 'completed';

          if (!purchaseCompleted && retryCount < MAX_RETRIES) {
            console.log(`Attempt ${retryCount + 1} of ${MAX_RETRIES} to confirm purchase`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            setRetryCount(prev => prev + 1);
            return;
          }

          if (purchaseCompleted) {
            localStorage.removeItem('currentPurchaseId');
            localStorage.removeItem('purchaseResultId');
          }
        }

        // Build query based on auth status
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id);

        if (userId) {
          // Authenticated user - check user_id
          query = query.eq('user_id', userId);
        } else if (accessToken) {
          // Guest with token - verify token and expiration
          query = query.eq('guest_access_token', accessToken)
            .gte('guest_access_expires_at', new Date().toISOString());
        }

        const { data, error: resultError } = await query.maybeSingle();

        if (resultError) throw resultError;

        if (!data) {
          if (isPostPurchase) {
            toast({
              title: "Purchase processed",
              description: "Please wait while we load your report...",
            });
            setTimeout(fetchResult, 2000);
            return;
          }
          
          toast({
            title: "Result not found",
            description: "The requested assessment result could not be found or access has expired",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setResult(data);

        if (purchaseCompleted) {
          toast({
            title: "Purchase successful!",
            description: "Your detailed report is now available.",
          });
        }

        // Show account creation prompt for guests
        if (!userId && data.guest_email) {
          toast({
            title: "Create an Account",
            description: "Create an account to keep permanent access to your report",
            action: (
              <a 
                href={`/auth?email=${encodeURIComponent(data.guest_email)}&action=signup`}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Sign Up
              </a>
            ),
            duration: 10000,
          });
        }

      } catch (error: any) {
        console.error('Error fetching result:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load assessment result",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, searchParams, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">
              Processing your purchase... ({retryCount}/{MAX_RETRIES})
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No Result Found</h2>
          <p className="mt-2 text-gray-600">The assessment result you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <DetailedReport
        personalityType={result.personality_type}
        analysis={result.detailed_analysis}
        scores={result.category_scores || {}}
      />
    </div>
  );
};

export { Assessment };
