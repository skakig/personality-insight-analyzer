
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coupon, PaginatedResponse } from "./types";
import { toast } from "@/components/ui/use-toast";

export const useAdminOperations = (userId: string) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  useEffect(() => {
    checkAdminStatus();
  }, [userId]);

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin, page, pageSize, searchQuery, couponFilter]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // Check if the user is an admin using the is_admin database function
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      
      // Build the query with filters
      let query = supabase
        .from('coupons')
        .select('*', { count: 'exact' });
      
      // Apply search filter if provided
      if (searchQuery) {
        query = query.ilike('code', `%${searchQuery}%`);
      }
      
      // Apply coupon status filter
      if (couponFilter === 'active') {
        query = query.eq('is_active', true)
          .is('expires_at', null)
          .or(`expires_at.gt.${new Date().toISOString()}`);
      } else if (couponFilter === 'inactive') {
        query = query.eq('is_active', false);
      } else if (couponFilter === 'expired') {
        query = query.not('expires_at', 'is', null)
          .lt('expires_at', new Date().toISOString());
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute the query with pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      // Set total count for pagination
      if (count !== null) {
        setTotalCoupons(count);
      }

      // Transform the data to match our Coupon type
      const transformedCoupons = data.map(coupon => ({
        ...coupon,
        applicable_products: coupon.applicable_products || []
      }));

      setCoupons(transformedCoupons as Coupon[]);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error fetching coupons",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCoupons(false);
    }
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'created_at' | 'current_uses'>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          ...couponData,
          current_uses: 0,
          created_by: userId
        })
        .select();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Coupon ${couponData.code} created successfully!`,
      });
      
      // Refresh coupons list
      fetchCoupons();
      return data[0];
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Error creating coupon",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Omit<Coupon, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      
      // Refresh coupons list
      fetchCoupons();
      return true;
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Error updating coupon",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      
      // Refresh coupons list
      fetchCoupons();
      return true;
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error deleting coupon",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    coupons,
    loadingCoupons,
    totalCoupons,
    page,
    pageSize,
    searchQuery,
    couponFilter,
    setPage,
    setPageSize,
    setSearchQuery,
    setCouponFilter,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
  };
};
