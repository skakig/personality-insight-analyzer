import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Affiliate } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export const AffiliateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    commission_rate: 0,
    status: "active" as "active" | "inactive" | "pending"
  });

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
      setFormData({
        name: data.name,
        email: data.email,
        commission_rate: data.commission_rate * 100, // Convert to percentage for display
        status: data.status as "active" | "inactive" | "pending"
      });
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
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate updated successfully",
      });
      
      fetchAffiliateDetails(id!);
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

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/20 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Affiliate Code</p>
              <p className="text-2xl font-bold mt-1">{affiliate.code}</p>
            </div>
            <div className="bg-secondary/20 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold mt-1">${affiliate.total_sales.toFixed(2)}</p>
            </div>
            <div className="bg-secondary/20 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">${affiliate.earnings.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
