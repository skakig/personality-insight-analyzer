
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

/**
 * Performs pre-verification checks to see if a result is already purchased
 * or direct access is possible
 */
export const usePreVerificationChecks = () => {
  const checkDirectAccess = async (id: string, userId?: string) => {
    // Skip verification if the result is already purchased
    if (!id) {
      return null;
    }
    
    try {
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('id', id);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: directResult } = await query.maybeSingle();
      
      if (directResult && (directResult.is_purchased || directResult.is_detailed)) {
        console.log('Result already purchased, skipping verification');
        return directResult;
      }
    } catch (error) {
      console.error('Error in direct access check:', error);
    }
    
    return null;
  };

  const showCreateAccountToast = (guestEmail: string) => {
    toast({
      title: "Create an Account",
      description: "Create an account to keep permanent access to your report",
      action: (
        <ToastAction 
          altText="Sign Up" 
          onClick={() => {
            window.location.href = `/auth?email=${encodeURIComponent(guestEmail)}&action=signup`;
          }}
        >
          Sign Up
        </ToastAction>
      ),
      duration: 10000,
    });
  };

  return {
    checkDirectAccess,
    showCreateAccountToast
  };
};
