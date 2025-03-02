
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Affiliate, AffiliateCommissionTier, AffiliateMonthlyPerformance } from "../types";

export const useAffiliateManagement = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<AffiliateCommissionTier[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<AffiliateMonthlyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'affiliates' | 'tiers' | 'performance'>('affiliates');
  
  // Pagination and search for affiliates
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  useEffect(() => {
    fetchAffiliates();
    fetchCommissionTiers();
    fetchMonthlyPerformance();
  }, [page, pageSize, searchQuery, statusFilter]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      
      // Build query with filters and pagination
      let query = supabase
        .from('affiliates')
        .select('*', { count: 'exact' });
      
      // Apply search if provided
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      // Save total count for pagination
      if (count !== null) {
        setTotalAffiliates(count);
      }
      
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

  const fetchMonthlyPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_monthly_performance')
        .select('*')
        .order('month', { ascending: false });

      if (error) throw error;
      
      setMonthlyPerformance(data as AffiliateMonthlyPerformance[]);
    } catch (error: any) {
      console.error('Error fetching monthly performance:', error);
    }
  };

  const calculateCommissionRate = (sales: number): number => {
    if (!commissionTiers || commissionTiers.length === 0) {
      return 0.10; // Default 10% if no tiers
    }
    
    // Find the appropriate tier based on sales amount
    for (let i = commissionTiers.length - 1; i >= 0; i--) {
      const tier = commissionTiers[i];
      if (sales >= tier.min_sales && (tier.max_sales === null || sales <= tier.max_sales)) {
        return tier.commission_rate;
      }
    }
    
    // Default to base rate if no matching tier
    return commissionTiers[0].commission_rate;
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
          total_sales: 0,
          current_month_sales: 0,
          previous_month_sales: 0
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

  const updateAffiliateStatus = async (affiliateId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', affiliateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Affiliate status updated to ${status}`,
      });

      // Refresh list
      fetchAffiliates();
    } catch (error: any) {
      console.error('Error updating affiliate status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update affiliate status",
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

  const recalculateAllCommissionRates = async () => {
    try {
      setLoading(true);
      
      // Fetch all affiliates without pagination
      const { data: allAffiliates, error: fetchError } = await supabase
        .from('affiliates')
        .select('*');
      
      if (fetchError) throw fetchError;
      
      // For each affiliate, recalculate commission rate based on current month's sales
      for (const affiliate of allAffiliates) {
        const newRate = calculateCommissionRate(affiliate.current_month_sales);
        
        // Only update if rate has changed
        if (newRate !== affiliate.commission_rate) {
          const { error: updateError } = await supabase
            .from('affiliates')
            .update({ 
              commission_rate: newRate,
              updated_at: new Date().toISOString()
            })
            .eq('id', affiliate.id);
            
          if (updateError) {
            console.error(`Error updating rate for affiliate ${affiliate.id}:`, updateError);
          }
        }
      }
      
      toast({
        title: "Success",
        description: "All affiliate commission rates recalculated based on current performance",
      });
      
      // Refresh data
      fetchAffiliates();
    } catch (error: any) {
      console.error('Error recalculating commission rates:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to recalculate commission rates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    affiliates,
    commissionTiers,
    monthlyPerformance,
    loading,
    viewMode,
    setViewMode,
    page,
    pageSize,
    totalAffiliates,
    searchQuery,
    statusFilter,
    setPage,
    setPageSize,
    setSearchQuery,
    setStatusFilter,
    fetchAffiliates,
    fetchCommissionTiers,
    fetchMonthlyPerformance,
    createAffiliate,
    createCommissionTier,
    updateAffiliateStatus,
    calculateCommissionRate,
    recalculateAllCommissionRates
  };
};
