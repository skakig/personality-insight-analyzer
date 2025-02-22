
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DetailedReport } from "@/components/results/DetailedReport";
import { toast } from "@/components/ui/use-toast";

const Assessment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

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

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        // Check for guest access via localStorage
        const guestQuizResultId = localStorage.getItem('guestQuizResultId');
        const isGuestAccess = guestQuizResultId === id;

        const query = supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id);

        // Add user-specific filters
        if (userId) {
          query.eq('user_id', userId);
        } else if (isGuestAccess) {
          // For guest access, verify the temp access token
          const guestAccessToken = localStorage.getItem('guestAccessToken');
          if (guestAccessToken) {
            query.eq('temp_access_token', guestAccessToken);
          }
        }

        const { data, error: resultError } = await query.maybeSingle();

        if (resultError) throw resultError;

        if (!data) {
          if (searchParams.get('success') === 'true' && retryCount < maxRetries) {
            // If this is post-purchase and we haven't maxed out retries, wait and try again
            await new Promise(resolve => setTimeout(resolve, 2000));
            setRetryCount(prev => prev + 1);
            return; // This will trigger another useEffect run
          }
          
          toast({
            title: "Result not found",
            description: "The requested assessment result could not be found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setResult(data);

        // Show success message if returning from purchase
        if (searchParams.get('success') === 'true') {
          toast({
            title: "Purchase successful!",
            description: "Your detailed report is now available.",
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
