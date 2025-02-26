
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DetailedReport } from "@/components/results/DetailedReport";
import { toast } from "@/components/ui/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";

const Assessment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

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

        if (isPostPurchase) {
          setVerifying(true);
          toast({
            title: "Verifying your purchase",
            description: "Please wait while we prepare your report...",
          });

          // Use the retry mechanism for post-purchase verification
          const verifiedResult = await verifyPurchaseWithRetry(id);
          
          if (verifiedResult) {
            setResult(verifiedResult);
            toast({
              title: "Purchase successful!",
              description: "Your detailed report is now available.",
            });
            setLoading(false);
            setVerifying(false);
            return;
          }
        }

        // Standard result fetch
        let query = supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id);

        // Add user-specific conditions
        if (userId) {
          query = query.eq('user_id', userId);
        } else if (accessToken) {
          query = query.eq('guest_access_token', accessToken)
            .gte('guest_access_expires_at', new Date().toISOString());
        }

        const { data, error: resultError } = await query.maybeSingle();

        if (resultError) throw resultError;

        if (!data) {
          if (verifying) {
            toast({
              title: "Purchase verification failed",
              description: "Please try refreshing the page or contact support if the issue persists.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Result not found",
              description: "The requested assessment result could not be found or access has expired",
              variant: "destructive",
            });
          }
          setLoading(false);
          return;
        }

        setResult(data);

        // Show account creation prompt for guests with custom URL
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
        setVerifying(false);
      }
    };

    fetchResult();
  }, [id, searchParams]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          {verifying && (
            <p className="text-sm text-gray-600">
              Verifying your purchase...
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
