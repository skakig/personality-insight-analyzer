
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateList } from "./AffiliateList";
import { CreateAffiliateForm } from "./CreateAffiliateForm";
import { CommissionTierList } from "./CommissionTierList";
import { CreateCommissionTierForm } from "./CreateCommissionTierForm";
import { toast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, Percent } from "lucide-react";

export const AffiliateSection = () => {
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalCommission: 0,
    conversionRate: 0
  });
  
  const fetchAffiliateStats = async () => {
    try {
      // Fetch affiliate count
      const { data: affiliates, error: affiliateError } = await supabase
        .from('affiliate_partners')
        .select('id, status');
        
      if (affiliateError) throw affiliateError;
      
      // Fetch commissions
      const { data: commissions, error: commissionError } = await supabase
        .from('affiliate_commissions')
        .select('amount');
        
      if (commissionError) throw commissionError;
      
      // Fetch referrals and conversions
      const { data: referrals, error: referralError } = await supabase
        .from('affiliate_referrals')
        .select('id, converted');
        
      if (referralError) throw referralError;
      
      const totalAffiliates = affiliates?.length || 0;
      const activeAffiliates = affiliates?.filter(a => a.status === 'active').length || 0;
      const totalCommission = commissions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      
      const totalReferrals = referrals?.length || 0;
      const conversions = referrals?.filter(r => r.converted).length || 0;
      const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0;
      
      setStats({
        totalAffiliates,
        activeAffiliates,
        totalCommission,
        conversionRate
      });
      
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    }
  };
  
  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Affiliate Program</h2>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Affiliates</p>
              <p className="text-2xl font-bold">{stats.totalAffiliates}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Affiliates</p>
              <p className="text-2xl font-bold">{stats.activeAffiliates}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-2xl font-bold">${(stats.totalCommission / 100).toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="affiliates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="commission-tiers">Commission Tiers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="affiliates" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Create New Affiliate</h3>
              <CreateAffiliateForm onSuccess={fetchAffiliateStats} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Affiliate List</h3>
              <AffiliateList onAffiliateUpdated={fetchAffiliateStats} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="commission-tiers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Create Commission Tier</h3>
              <CreateCommissionTierForm onSuccess={fetchAffiliateStats} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Commission Tiers</h3>
              <CommissionTierList />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
