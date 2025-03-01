
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useFetchResult = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResultById = async (
    id: string, 
    options: { 
      userId?: string, 
      accessToken?: string | null 
    } = {}
  ) => {
    try {
      if (!id || id === ':id?') {
        toast({
          title: "Invalid assessment ID",
          description: "Please check the URL and try again",
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }

      // Build query with user-specific conditions
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id);

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      } else if (options.accessToken) {
        query = query.eq('guest_access_token', options.accessToken)
          .gte('guest_access_expires_at', new Date().toISOString());
      }

      const { data, error: resultError } = await query.maybeSingle();

      if (resultError) {
        console.error('Result fetch error:', resultError);
        throw resultError;
      }

      if (!data) {
        toast({
          title: "Result not found",
          description: "The requested assessment result could not be found or access has expired",
          variant: "destructive",
        });
        return null;
      }

      console.log('Assessment data loaded successfully:', {
        resultId: data.id,
        isPurchased: data.is_purchased,
        isDetailed: data.is_detailed,
        accessMethod: data.access_method,
        status: data.purchase_status
      });

      setResult(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching result:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load assessment result",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    result,
    loading,
    setLoading,
    setResult,
    fetchResultById
  };
};
