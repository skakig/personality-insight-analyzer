
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAffiliateManagement } from "./useAffiliateManagement";
import { AffiliateList } from "./AffiliateList";
import { CreateAffiliateForm } from "./CreateAffiliateForm";
import { CommissionTierList } from "./CommissionTierList";
import { CreateCommissionTierForm } from "../affiliates/CreateCommissionTierForm";

export const AffiliateSection = () => {
  const {
    affiliates,
    commissionTiers,
    loading,
    viewMode,
    setViewMode,
    fetchAffiliates,
    fetchCommissionTiers,
    createAffiliate,
    createCommissionTier
  } = useAffiliateManagement();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="affiliates" onValueChange={(value) => setViewMode(value as 'affiliates' | 'tiers')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
              <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
            </TabsList>
            <TabsContent value="affiliates" className="space-y-4 pt-4">
              <CreateAffiliateForm onCreateAffiliate={createAffiliate} />
              <AffiliateList 
                affiliates={affiliates} 
                onRefresh={fetchAffiliates} 
              />
            </TabsContent>
            <TabsContent value="tiers" className="space-y-4 pt-4">
              <CreateCommissionTierForm onCreateTier={createCommissionTier} />
              <CommissionTierList 
                commissionTiers={commissionTiers} 
                onRefresh={fetchCommissionTiers} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
