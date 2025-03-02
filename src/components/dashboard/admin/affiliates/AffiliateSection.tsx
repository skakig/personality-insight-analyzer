
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

export const AffiliateSection = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<any[]>([]);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Affiliate Program</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AffiliatePerformanceCard
          title="Total Affiliates"
          value={totalAffiliates.toString()}
          description="Total number of registered affiliates"
          icon="users"
        />
        <AffiliatePerformanceCard
          title="Active Affiliates"
          value={activeAffiliates.toString()}
          description="Number of currently active affiliates"
          icon="userCheck"
        />
        <AffiliatePerformanceCard
          title="Total Commissions"
          value={`$${totalEarnings.toFixed(2)}`}
          description="Total commissions paid to affiliates"
          icon="dollarSign"
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
                  <AffiliateList />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Affiliate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateAffiliateForm />
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
                  <CommissionTierList commissionTiers={commissionTiers} onRefresh={fetchData} />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Create Commission Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateCommissionTierForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
