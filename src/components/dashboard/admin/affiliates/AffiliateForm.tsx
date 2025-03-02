
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Affiliate } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

interface AffiliateFormProps {
  affiliate: Affiliate;
  onSaved: () => void;
}

export const AffiliateForm = ({ affiliate, onSaved }: AffiliateFormProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: affiliate.name,
    email: affiliate.email,
    commission_rate: affiliate.commission_rate * 100, // Convert to percentage for display
    status: affiliate.status
  });

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
      status: e.target.value as "active" | "inactive" | "pending"
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate form data
      if (!formData.name || !formData.email) {
        toast({
          title: "Validation Error",
          description: "Name and email are required",
          variant: "destructive",
        });
        return;
      }

      // Convert commission rate back to decimal for storage
      const commissionRateDecimal = formData.commission_rate / 100;
      
      const { error } = await supabase
        .from('affiliates')
        .update({
          name: formData.name,
          email: formData.email,
          commission_rate: commissionRateDecimal,
          status: formData.status as "active" | "inactive" | "pending",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Affiliate: {affiliate.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
            <Input
              id="commission_rate"
              name="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commission_rate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
