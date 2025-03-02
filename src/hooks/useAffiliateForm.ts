
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Affiliate } from "@/components/dashboard/admin/types";

type FormData = {
  name: string;
  email: string;
  commission_rate: number;
  status: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  commission_rate?: string;
};

export const useAffiliateForm = (affiliate: Affiliate, onSaved: () => void) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: affiliate.name,
    email: affiliate.email,
    commission_rate: affiliate.commission_rate * 100, // Convert to percentage for display
    status: affiliate.status
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      newErrors.commission_rate = "Commission rate must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'commission_rate' ? parseFloat(value) : value
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      status: e.target.value
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Convert commission rate back to decimal for storage
      const commissionRateDecimal = formData.commission_rate / 100;
      
      const { error } = await supabase
        .from('affiliates')
        .update({
          name: formData.name,
          email: formData.email,
          commission_rate: commissionRateDecimal,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', affiliate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate updated successfully",
      });
      
      onSaved();
    } catch (error: any) {
      console.error("Error updating affiliate:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update affiliate",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    saving,
    errors,
    handleInputChange,
    handleStatusChange,
    handleSave
  };
};
