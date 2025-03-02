
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart, 
  Gift, 
  UserPlus, 
  Search,
  ChevronLeft,
  ChevronRight,
  List
} from "lucide-react";
import { CreateCouponForm } from "./CreateCouponForm";
import { CouponList } from "./CouponList";
import { AffiliateSection } from "./affiliates/AffiliateSection";
import { SchemaUpdater } from "./SchemaUpdater";
import { useAdminOperations } from "./useAdminOperations";
import { Input } from "@/components/ui/input";

interface AdminDashboardProps {
  userId: string;
}

export const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  const { isAdmin, loading, coupons, loadingCoupons, fetchCoupons } = useAdminOperations(userId);
  const [activeTab, setActiveTab] = useState("coupons");
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Handle initial path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/coupons')) {
      setActiveTab("coupons");
    } else if (path.includes('/affiliates')) {
      setActiveTab("affiliates");
    } else if (path.includes('/analytics')) {
      setActiveTab("analytics");
    } else if (path.includes('/users')) {
      setActiveTab("users");
    } else if (path.includes('/assessments')) {
      setActiveTab("assessments");
    } else if (path.includes('/payments')) {
      setActiveTab("payments");
    } else if (path.includes('/system')) {
      setActiveTab("system");
    }
  }, [location.pathname]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/admin/${value}`);
  };

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
  
  // Filter coupons based on search term
  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginate coupons
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* Admin Sidebar */}
        <div className="hidden md:flex flex-col border-r bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Manage your platform</p>
          </div>
          <div className="p-3 flex flex-col space-y-1 flex-1">
            <Link 
              to="/dashboard/admin/coupons" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/coupons') || activeTab === 'coupons' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("coupons")}
            >
              <Gift size={18} />
              Coupon Management
            </Link>
            <Link 
              to="/dashboard/admin/affiliates" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/affiliates') || activeTab === 'affiliates' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("affiliates")}
            >
              <UserPlus size={18} />
              Affiliate Program
            </Link>
            <Link 
              to="/dashboard/admin/analytics" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/analytics') || activeTab === 'analytics' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart size={18} />
              Analytics
            </Link>
            <Link 
              to="/dashboard/admin/users" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/users') || activeTab === 'users' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("users")}
            >
              <Users size={18} />
              User Management
            </Link>
            <Link 
              to="/dashboard/admin/assessments" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/assessments') || activeTab === 'assessments' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("assessments")}
            >
              <Database size={18} />
              Assessments
            </Link>
            <Link 
              to="/dashboard/admin/payments" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/payments') || activeTab === 'payments' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard size={18} />
              Payments
            </Link>
            <Link 
              to="/dashboard/admin/system" 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${location.pathname.includes('/system') || activeTab === 'system' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab("system")}
            >
              <Settings size={18} />
              System
            </Link>
          </div>
          <div className="p-4 border-t mt-auto">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Tabs defaultValue="coupons" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {activeTab === 'coupons' && 'Coupon Management'}
                {activeTab === 'affiliates' && 'Affiliate Program'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'assessments' && 'Assessment Management'}
                {activeTab === 'payments' && 'Payment Management'}
                {activeTab === 'system' && 'System Management'}
              </h1>
              <div className="md:hidden">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="coupons">Coupons</TabsTrigger>
                  <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Coupon Management</h2>
                      <p className="text-gray-600">Create and manage discount coupons for your products.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search coupons..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <CreateCouponForm 
                    userId={userId} 
                    onCouponCreated={fetchCoupons} 
                  />
                  
                  <CouponList 
                    coupons={currentCoupons} 
                    onCouponUpdated={fetchCoupons} 
                    loading={loadingCoupons} 
                  />
                  
                  {/* Pagination */}
                  {filteredCoupons.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCoupons.length)} of {filteredCoupons.length} coupons
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm">
                          Page {currentPage} of {Math.max(1, totalPages)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages || totalPages === 0}
                          className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="affiliates" className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Affiliate Management</h2>
                      <p className="text-gray-600">Manage your affiliate partners and commission structure.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search affiliates..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <AffiliateSection />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">System Management</h2>
                      <p className="text-gray-600">Database and system utilities.</p>
                    </div>
                  </div>
                  
                  <SchemaUpdater />
                </div>
              </Card>
            </TabsContent>
            
            {/* Placeholder tabs for other sections */}
            <TabsContent value="analytics">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
                      <p className="text-gray-600">Track your platform performance and usage metrics.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search analytics..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="users">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">User Management</h2>
                      <p className="text-gray-600">Manage user accounts and permissions.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="assessments">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Assessment Management</h2>
                      <p className="text-gray-600">Manage assessments and results.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search assessments..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="payments">
              <Card>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">Payment Management</h2>
                      <p className="text-gray-600">Manage payment processing and transactions.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search payments..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
