
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Coupon } from "./types";

export const useAdminOperations = (userId: string) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      if (!userId) {
        console.error('No user ID provided to AdminSection');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Checking admin status for user:', userId);

      // First try using the is_admin database function
      const { data: isAdminResult, error: funcError } = await supabase.rpc('is_admin', {
        user_id: userId
      });
      
      if (funcError) {
        console.error('Error checking admin status with RPC:', funcError);
        // Fall back to direct query if RPC fails
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking admin status:', {
            error,
            userId
          });
          throw error;
        }

        const hasAdminAccess = !!data;
        console.log('Admin status result (direct query):', {
          userId,
          isAdmin: hasAdminAccess
        });
        
        setIsAdmin(hasAdminAccess);
      } else {
        console.log('Admin status result (RPC):', {
          userId,
          isAdmin: isAdminResult
        });
        
        setIsAdmin(!!isAdminResult);
      }
    } catch (error: any) {
      console.error('Error in checkAdminStatus:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoadingCoupons(false);
    }
  };

  return {
    isAdmin,
    loading,
    coupons,
    loadingCoupons,
    fetchCoupons
  };
};
