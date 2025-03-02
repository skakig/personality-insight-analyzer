import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Check, Copy, Mail, User } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AffiliatePerformanceCard } from "./AffiliatePerformanceCard";
import { Affiliate } from "./types";

interface AffiliateDetailsProps {
  affiliate: Affiliate;
  onClose: () => void;
}

export function AffiliateDetails({ affiliate, onClose }: AffiliateDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(affiliate.status === 'active');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliate.code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleStatusChange = async () => {
    const newStatus = !status;
    setStatus(newStatus);

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status: newStatus ? 'active' : 'inactive' })
        .eq('id', affiliate.id);

      if (error) {
        console.error("Error updating affiliate status:", error);
        toast({
          title: "Error",
          description: "Failed to update affiliate status. Please try again.",
          variant: "destructive",
        });
        setStatus(status); // Revert back to the original status
      } else {
        toast({
          title: "Success",
          description: `Affiliate status updated to ${newStatus ? 'active' : 'inactive'}.`,
        });
      }
    } catch (error) {
      console.error("Error updating affiliate status:", error);
      toast({
        title: "Error",
        description: "Failed to update affiliate status. Please try again.",
        variant: "destructive",
      });
      setStatus(status); // Revert back to the original status
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Affiliate Details</h2>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={affiliate.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={affiliate.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Affiliate Code</Label>
              <div className="flex items-center">
                <Input id="code" value={affiliate.code} readOnly className="mr-2" />
                <Button variant="secondary" size="icon" onClick={handleCopyCode} disabled={copied}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate</Label>
              <Input
                id="commission_rate"
                value={`${affiliate.commission_rate}%`}
                readOnly
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              <Switch id="status" checked={status} onCheckedChange={handleStatusChange} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <AffiliatePerformanceCard
          statTitle="Total Referrals"
          statValue="845"
          statDescription="Total clicks on affiliate links"
          iconName="users"
        />
        <AffiliatePerformanceCard
          statTitle="Conversion Rate"
          statValue="12.8%"
          statDescription="Referrals resulting in purchases"
          iconName="chart"
        />
        <AffiliatePerformanceCard
          statTitle="Total Earnings"
          statValue={`$${affiliate.earnings.toFixed(2)}`}
          statDescription="Lifetime commission earnings"
          iconName="dollar"
        />
      </div>
    </div>
  );
}
