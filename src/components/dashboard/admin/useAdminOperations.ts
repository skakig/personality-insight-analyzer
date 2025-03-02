
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coupon } from "./types";
import { toast } from "@/components/ui/use-toast";

export const useAdminOperations = (userId: string) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [userId]);

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
        // If the user is an admin, fetch coupons
        if (data) {
          fetchCoupons();
        }
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
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our Coupon type
      const transformedCoupons = data.map(coupon => ({
        ...coupon,
        applicable_products: coupon.applicable_products || []
      })) as Coupon[];

      setCoupons(transformedCoupons);
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

  return {
    isAdmin,
    loading,
    coupons,
    loadingCoupons,
    fetchCoupons
  };
};
