
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAffiliateManagement } from "./useAffiliateManagement";
import { CreateAffiliateForm } from "./CreateAffiliateForm";
import { AffiliateList } from "./AffiliateList";
import { CreateCommissionTierForm } from "./CreateCommissionTierForm";
import { CommissionTierList } from "./CommissionTierList";

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
        </div>

        {viewMode === 'affiliates' ? (
          <>
            <CreateAffiliateForm onCreateAffiliate={createAffiliate} />
            <AffiliateList 
              affiliates={affiliates} 
              loading={loading} 
              onRefresh={fetchAffiliates} 
            />
          </>
        ) : (
          <>
            <CreateCommissionTierForm onCreateTier={createCommissionTier} />
            <CommissionTierList 
              commissionTiers={commissionTiers} 
              onRefresh={fetchCommissionTiers} 
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
