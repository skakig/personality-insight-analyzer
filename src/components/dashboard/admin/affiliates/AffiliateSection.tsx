
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateList } from "./AffiliateList";
import { CreateAffiliateForm } from "./CreateAffiliateForm";
import { CommissionTierList } from "./CommissionTierList";
import { CreateCommissionTierForm } from "./CreateCommissionTierForm";
import { AffiliatePerformanceCard } from "./AffiliatePerformanceCard";
import { toast } from "@/hooks/use-toast";
import { Affiliate, CommissionTier } from "../types";

export const AffiliateSection = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch affiliates data
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (affiliatesError) throw affiliatesError;
      
      // Fetch commission tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('affiliate_commission_tiers')
        .select('*')
        .order('min_sales', { ascending: true });
        
      if (tiersError) throw tiersError;
      
      setAffiliates(affiliatesData || []);
      setCommissionTiers(tiersData || []);
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliate data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate some basic statistics
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
  const totalEarnings = affiliates.reduce((sum, a) => sum + (a.earnings || 0), 0);
  
  const handleCreateAffiliate = async (name: string, email: string) => {
    try {
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
          commission_rate: 0.10, // Default 10%
          status: 'active',
          earnings: 0,
          total_sales: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Affiliate ${name} created with code ${generatedCode}`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create affiliate",
        variant: "destructive",
      });
    }
  };

  const handleCreateCommissionTier = async (minSales: string, maxSales: string, commissionRate: string) => {
    try {
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

      fetchData();
    } catch (error: any) {
      console.error('Error creating commission tier:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create commission tier",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Affiliate Program</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AffiliatePerformanceCard
          statTitle="Total Affiliates"
          statValue={totalAffiliates.toString()}
          statDescription="Total number of registered affiliates"
          iconName="users"
        />
        <AffiliatePerformanceCard
          statTitle="Active Affiliates"
          statValue={activeAffiliates.toString()}
          statDescription="Number of currently active affiliates"
          iconName="userCheck"
        />
        <AffiliatePerformanceCard
          statTitle="Total Commissions"
          statValue={`$${totalEarnings.toFixed(2)}`}
          statDescription="Total commissions paid to affiliates"
          iconName="dollarSign"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="commission-tiers">Commission Tiers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Affiliates</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading...</p>
                ) : affiliates.length > 0 ? (
                  <ul className="space-y-2">
                    {affiliates.slice(0, 5).map(affiliate => (
                      <li key={affiliate.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span>{affiliate.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          affiliate.status === 'active' ? 'bg-green-100 text-green-800' : 
                          affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {affiliate.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No affiliates found</p>
                )}
                <Button 
                  variant="ghost" 
                  className="mt-4 w-full" 
                  onClick={() => setActiveTab("affiliates")}
                >
                  View All Affiliates
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Commission Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading...</p>
                ) : commissionTiers.length > 0 ? (
                  <ul className="space-y-2">
                    {commissionTiers.map(tier => (
                      <li key={tier.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span>
                          {tier.min_sales} - {tier.max_sales || 'Unlimited'} Sales
                        </span>
                        <span className="font-medium">{(tier.commission_rate * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No commission tiers defined</p>
                )}
                <Button 
                  variant="ghost" 
                  className="mt-4 w-full" 
                  onClick={() => setActiveTab("commission-tiers")}
                >
                  Manage Commission Tiers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="affiliates">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Affiliates</CardTitle>
                </CardHeader>
                <CardContent>
                  <AffiliateList 
                    affiliates={affiliates} 
                    onRefresh={fetchData} 
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Affiliate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateAffiliateForm 
                    onCreateAffiliate={handleCreateAffiliate} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="commission-tiers">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CommissionTierList 
                    commissionTiers={commissionTiers} 
                    onRefresh={fetchData} 
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Create Commission Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateCommissionTierForm 
                    onCreateTier={handleCreateCommissionTier} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
