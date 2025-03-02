
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, CreditCard, Settings, BarChart, Gift, UserPlus } from "lucide-react";
import { CreateCouponForm } from "./CreateCouponForm";
import { CouponList } from "./CouponList";
import { AffiliateSection } from "./affiliates/AffiliateSection";
import { SchemaUpdater } from "./SchemaUpdater";
import { useAdminOperations } from "./useAdminOperations";

interface AdminDashboardProps {
  userId: string;
}

export const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  const { isAdmin, loading, coupons, loadingCoupons, fetchCoupons } = useAdminOperations(userId);
  const [activeTab, setActiveTab] = useState("coupons");
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="grid md:grid-cols-[240px_1fr] min-h-screen">
        {/* Admin Sidebar */}
        <div className="hidden md:flex flex-col border-r bg-gray-50/50">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Admin Dashboard</h2>
          </div>
          <div className="p-3 flex flex-col space-y-1">
            <Link 
              to="/dashboard/admin/coupons" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/coupons') || activeTab === 'coupons' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("coupons")}
            >
              <Gift size={18} />
              Coupon Management
            </Link>
            <Link 
              to="/dashboard/admin/affiliates" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/affiliates') || activeTab === 'affiliates' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("affiliates")}
            >
              <UserPlus size={18} />
              Affiliate Program
            </Link>
            <Link 
              to="/dashboard/admin/analytics" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/analytics') || activeTab === 'analytics' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart size={18} />
              Analytics
            </Link>
            <Link 
              to="/dashboard/admin/users" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/users') || activeTab === 'users' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("users")}
            >
              <Users size={18} />
              User Management
            </Link>
            <Link 
              to="/dashboard/admin/assessments" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/assessments') || activeTab === 'assessments' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("assessments")}
            >
              <Database size={18} />
              Assessments
            </Link>
            <Link 
              to="/dashboard/admin/payments" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/payments') || activeTab === 'payments' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard size={18} />
              Payments
            </Link>
            <Link 
              to="/dashboard/admin/system" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/system') || activeTab === 'system' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("system")}
            >
              <Settings size={18} />
              System
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Tabs defaultValue="coupons" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="md:hidden grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  <h1 className="text-2xl font-semibold">Coupon Management</h1>
                  <p className="text-gray-600">Create and manage discount coupons for your products.</p>
                  
                  <CreateCouponForm 
                    userId={userId} 
                    onCouponCreated={fetchCoupons} 
                  />
                  
                  <CouponList 
                    coupons={coupons} 
                    onCouponUpdated={fetchCoupons} 
                    loading={loadingCoupons} 
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="affiliates" className="space-y-6">
              <Card>
                <div className="p-6">
                  <h1 className="text-2xl font-semibold mb-4">Affiliate Management</h1>
                  <p className="text-gray-600 mb-6">Manage your affiliate partners and commission structure.</p>
                  
                  <AffiliateSection />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <Card>
                <div className="p-6">
                  <h1 className="text-2xl font-semibold mb-4">System Management</h1>
                  <p className="text-gray-600 mb-6">Database and system utilities.</p>
                  
                  <SchemaUpdater />
                </div>
              </Card>
            </TabsContent>
            
            {/* Placeholder tabs for other sections */}
            <TabsContent value="analytics">
              <Card><div className="p-6"><h1 className="text-2xl font-semibold">Analytics Dashboard</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></Card>
            </TabsContent>
            <TabsContent value="users">
              <Card><div className="p-6"><h1 className="text-2xl font-semibold">User Management</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></Card>
            </TabsContent>
            <TabsContent value="assessments">
              <Card><div className="p-6"><h1 className="text-2xl font-semibold">Assessment Management</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></Card>
            </TabsContent>
            <TabsContent value="payments">
              <Card><div className="p-6"><h1 className="text-2xl font-semibold">Payment Management</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
