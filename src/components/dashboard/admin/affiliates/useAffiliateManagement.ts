
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Affiliate, AffiliateCommissionTier } from "../types";

export const useAffiliateManagement = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<AffiliateCommissionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'affiliates' | 'tiers'>('affiliates');

  useEffect(() => {
    fetchAffiliates();
    fetchCommissionTiers();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAffiliates(data as Affiliate[]);
    } catch (error: any) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Error",
        description: "Failed to load affiliates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_commission_tiers')
        .select('*')
        .order('min_sales', { ascending: true });

      if (error) throw error;
      
      setCommissionTiers(data as AffiliateCommissionTier[]);
    } catch (error: any) {
      console.error('Error fetching commission tiers:', error);
    }
  };

  const createAffiliate = async (name: string, email: string) => {
    try {
      if (!name || !email) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      
      // Generate affiliate code from name (first letter + last name + random digits)
      const nameParts = name.split(' ');
      const baseName = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1]).toUpperCase() 
        : nameParts[0].substring(0, 4).toUpperCase();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `${baseName}${randomDigits}`;

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          name: name,
          email: email,
          code: generatedCode,
          commission_rate: getBaseCommissionRate(),
          status: 'active',
          earnings: 0,
          total_sales: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Create corresponding coupon automatically
      await supabase
        .from('coupons')
        .insert({
          code: generatedCode,
          discount_type: 'percentage',
          discount_amount: 10, // Default 10% discount
          max_uses: 1000,
          is_active: true,
          affiliate_id: data.id,
          applicable_products: ['report'] // Default to apply to reports
        });

      toast({
        title: "Success",
        description: `Affiliate ${name} created with code ${generatedCode}`,
      });

      // Refresh list
      fetchAffiliates();
    } catch (error: any) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create affiliate",
        variant: "destructive",
      });
    }
  };

  const createCommissionTier = async (minSales: string, maxSales: string, commissionRate: string) => {
    try {
      if (!minSales || !commissionRate) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('affiliate_commission_tiers')
        .insert({
          min_sales: parseFloat(minSales),
          max_sales: maxSales ? parseFloat(maxSales) : null,
          commission_rate: parseFloat(commissionRate) / 100 // Convert from percentage to decimal
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Commission tier created successfully",
      });

      // Refresh list
      fetchCommissionTiers();
    } catch (error: any) {
      console.error('Error creating commission tier:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create commission tier",
        variant: "destructive",
      });
    }
  };

  const getBaseCommissionRate = () => {
    // Find the lowest tier commission rate
    if (commissionTiers.length > 0) {
      return commissionTiers.reduce((lowest, tier) => 
        tier.min_sales < lowest.min_sales ? tier : lowest
      ).commission_rate;
    }
    return 0.10; // Default 10% if no tiers defined
  };

  return {
    affiliates,
    commissionTiers,
    loading,
    viewMode,
    setViewMode,
    fetchAffiliates,
    fetchCommissionTiers,
    createAffiliate,
    createCommissionTier
  };
};
