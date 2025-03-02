
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Affiliate } from "../types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AffiliateForm } from "./AffiliateForm";
import { AffiliatePerformanceCard } from "./AffiliatePerformanceCard";

export const AffiliateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAffiliateDetails(id);
    }
  }, [id]);

  const fetchAffiliateDetails = async (affiliateId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();

      if (error) throw error;
      
      setAffiliate(data as Affiliate);
    } catch (error) {
      console.error("Error fetching affiliate details:", error);
      toast({
        title: "Error",
        description: "Failed to load affiliate details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Affiliate not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Affiliates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/dashboard/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Affiliates
        </Button>
      </div>

      <AffiliateForm 
        affiliate={affiliate}
        onSaved={() => fetchAffiliateDetails(id!)}
      />

      <AffiliatePerformanceCard affiliate={affiliate} />
    </div>
  );
};
