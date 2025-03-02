
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PlusCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Affiliate, AffiliateCommissionTier } from "./types";

export const AffiliateSection = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<AffiliateCommissionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAffiliateName, setNewAffiliateName] = useState("");
  const [newAffiliateEmail, setNewAffiliateEmail] = useState("");
  const [creatingAffiliate, setCreatingAffiliate] = useState(false);
  const [viewMode, setViewMode] = useState<'affiliates' | 'tiers'>('affiliates');
  
  // For new commission tier form
  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [creatingTier, setCreatingTier] = useState(false);

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
      setAffiliates(data || []);
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
      setCommissionTiers(data || []);
    } catch (error: any) {
      console.error('Error fetching commission tiers:', error);
    }
  };

  const createAffiliate = async () => {
    try {
      if (!newAffiliateName || !newAffiliateEmail) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      setCreatingAffiliate(true);
      
      // Generate affiliate code from name (first letter + last name + random digits)
      const nameParts = newAffiliateName.split(' ');
      const baseName = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1]).toUpperCase() 
        : nameParts[0].substring(0, 4).toUpperCase();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `${baseName}${randomDigits}`;

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          name: newAffiliateName,
          email: newAffiliateEmail,
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
          affiliate_id: data.id
        });

      toast({
        title: "Success",
        description: `Affiliate ${newAffiliateName} created with code ${generatedCode}`,
      });

      // Reset form and refresh list
      setNewAffiliateName("");
      setNewAffiliateEmail("");
      fetchAffiliates();
    } catch (error: any) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create affiliate",
        variant: "destructive",
      });
    } finally {
      setCreatingAffiliate(false);
    }
  };

  const createCommissionTier = async () => {
    try {
      if (!minSales || !commissionRate) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        });
        return;
      }

      setCreatingTier(true);
      
      const { error } = await supabase
        .from('affiliate_commission_tiers')
        .insert({
          min_sales: parseInt(minSales),
          max_sales: maxSales ? parseInt(maxSales) : null,
          commission_rate: parseFloat(commissionRate)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Commission tier created successfully",
      });

      // Reset form and refresh list
      setMinSales("");
      setMaxSales("");
      setCommissionRate("");
      fetchCommissionTiers();
    } catch (error: any) {
      console.error('Error creating commission tier:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create commission tier",
        variant: "destructive",
      });
    } finally {
      setCreatingTier(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Marketing</CardTitle>
        <CardDescription>Manage affiliates and commission tiers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === 'affiliates' ? "default" : "outline"}
              onClick={() => setViewMode('affiliates')}
            >
              Affiliates
            </Button>
            <Button 
              variant={viewMode === 'tiers' ? "default" : "outline"}
              onClick={() => setViewMode('tiers')}
            >
              Commission Tiers
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={viewMode === 'affiliates' ? fetchAffiliates : fetchCommissionTiers}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {viewMode === 'affiliates' ? (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Create New Affiliate</h3>
              <div className="flex flex-col space-y-2">
                <Input
                  placeholder="Affiliate Name"
                  value={newAffiliateName}
                  onChange={(e) => setNewAffiliateName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newAffiliateEmail}
                  onChange={(e) => setNewAffiliateEmail(e.target.value)}
                />
                <Button 
                  onClick={createAffiliate} 
                  disabled={creatingAffiliate}
                >
                  {creatingAffiliate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Affiliate
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Active Affiliates</h3>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : affiliates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No affiliates found. Create your first affiliate above.
                </p>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell className="font-medium">{affiliate.name}</TableCell>
                          <TableCell>{affiliate.code}</TableCell>
                          <TableCell>{(affiliate.commission_rate * 100).toFixed(0)}%</TableCell>
                          <TableCell className="text-right">${(affiliate.total_sales / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(affiliate.earnings / 100).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Create Commission Tier</h3>
              <div className="flex flex-col space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min Sales ($)"
                    value={minSales}
                    onChange={(e) => setMinSales(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max Sales ($, optional)"
                    value={maxSales}
                    onChange={(e) => setMaxSales(e.target.value)}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Commission Rate (%)"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
                <Button 
                  onClick={createCommissionTier} 
                  disabled={creatingTier}
                >
                  {creatingTier ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Tier
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Commission Tiers</h3>
              {commissionTiers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No commission tiers found. Create your first tier above.
                </p>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Min Sales</TableHead>
                        <TableHead>Max Sales</TableHead>
                        <TableHead>Commission Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionTiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>${(tier.min_sales / 100).toFixed(2)}</TableCell>
                          <TableCell>{tier.max_sales ? `$${(tier.max_sales / 100).toFixed(2)}` : 'No limit'}</TableCell>
                          <TableCell>{(tier.commission_rate * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
