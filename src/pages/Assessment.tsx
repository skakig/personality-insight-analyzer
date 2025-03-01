
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DetailedReport } from "@/components/results/DetailedReport";
import { toast } from "@/hooks/use-toast";
import { verifyPurchaseWithRetry } from "@/utils/purchaseUtils";
import { Loader2 } from "lucide-react";

const Assessment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

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
        const accessToken = searchParams.get('token') || localStorage.getItem('guestAccessToken');
        const isPostPurchase = searchParams.get('success') === 'true';
        const stripeSessionId = localStorage.getItem('stripeSessionId');
        const trackingId = localStorage.getItem('purchaseTrackingId');
        const storedResultId = localStorage.getItem('purchaseResultId');

        console.log('Assessment page loaded:', {
          resultId: id,
          userId: userId || 'guest',
          hasAccessToken: !!accessToken,
          isPostPurchase,
          hasStripeSession: !!stripeSessionId,
          hasTrackingId: !!trackingId,
          storedResultId,
          timestamp: new Date().toISOString()
        });

        // Check if this is post-purchase verification
        if (isPostPurchase || (stripeSessionId && id === storedResultId)) {
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
            
            // Clear purchase-related localStorage
            localStorage.removeItem('stripeSessionId');
            localStorage.removeItem('guestAccessToken');
            localStorage.removeItem('purchaseTrackingId');
            localStorage.removeItem('purchaseResultId');
            
            return;
          } else {
            console.log('Purchase verification failed after retries');
            setVerificationAttempts(prev => prev + 1);
            
            // If this is the first failed attempt, try one more time
            if (verificationAttempts === 0) {
              toast({
                title: "Verification in progress",
                description: "We're still processing your purchase. Please wait a moment...",
              });
              
              // Try a manual update as a last resort
              try {
                if (stripeSessionId) {
                  await supabase
                    .from('quiz_results')
                    .update({ 
                      is_purchased: true,
                      purchase_status: 'completed',
                      purchase_completed_at: new Date().toISOString(),
                      access_method: 'purchase'
                    })
                    .eq('id', id)
                    .eq('stripe_session_id', stripeSessionId);
                }
              } catch (error) {
                console.error('Final manual update failed:', error);
              }
            } else {
              toast({
                title: "Purchase verification delayed",
                description: "Your purchase may take a few moments to process. You can refresh the page or check again shortly.",
                variant: "destructive",
              });
            }
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

        if (resultError) {
          console.error('Result fetch error:', resultError);
          throw resultError;
        }

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
          setVerifying(false);
          return;
        }

        console.log('Assessment data loaded successfully:', {
          resultId: data.id,
          isPurchased: data.is_purchased,
          isDetailed: data.is_detailed,
          accessMethod: data.access_method,
          status: data.purchase_status
        });

        setResult(data);
        setLoading(false);
        setVerifying(false);

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
        setLoading(false);
        setVerifying(false);
      }
    };

    fetchResult();
  }, [id, searchParams, verificationAttempts]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {verifying && (
            <p className="text-sm text-gray-600">
              {verificationAttempts === 0 
                ? "Verifying your purchase..." 
                : "Still processing your purchase..."}
            </p>
          )}
          {verificationAttempts > 0 && (
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Refresh Page
            </Button>
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

// Ensure Button is imported
import { Button } from "@/components/ui/button";
