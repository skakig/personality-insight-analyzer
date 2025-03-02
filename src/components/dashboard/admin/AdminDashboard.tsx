
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./layout/AdminLayout";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Admin section components
import { CouponManagement } from "./sections/CouponManagement";
import { AffiliateSection } from "./affiliates/AffiliateSection";
import { Loader2 } from "lucide-react";

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in to access the admin panel");
        setIsAdmin(false);
        return;
      }
      
      // Check if the user is an admin
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setError("Failed to verify admin status");
        setIsAdmin(false);
      } else {
        setIsAdmin(data);
        
        if (!data) {
          setError("You do not have permission to access the admin panel");
        }
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setError("An unexpected error occurred");
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Admin Access Required</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p>You need admin permissions to view this page.</p>
        <a 
          href="/dashboard" 
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/dashboard/admin/coupons" replace />} 
      />
      <Route 
        path="/coupons" 
        element={
          <AdminLayout title="Coupon Management">
            <CouponManagement />
          </AdminLayout>
        } 
      />
      <Route 
        path="/affiliates/*" 
        element={
          <AdminLayout title="Affiliate Program">
            <AffiliateSection />
          </AdminLayout>
        } 
      />
      {/* Placeholder routes for future sections */}
      <Route 
        path="/analytics" 
        element={
          <AdminLayout title="Analytics">
            <PlaceholderSection title="Analytics" />
          </AdminLayout>
        } 
      />
      <Route 
        path="/users" 
        element={
          <AdminLayout title="User Management">
            <PlaceholderSection title="User Management" />
          </AdminLayout>
        } 
      />
      <Route 
        path="/assessments" 
        element={
          <AdminLayout title="Assessments">
            <PlaceholderSection title="Assessments" />
          </AdminLayout>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <AdminLayout title="Payments">
            <PlaceholderSection title="Payments" />
          </AdminLayout>
        } 
      />
      <Route 
        path="/system" 
        element={
          <AdminLayout title="System">
            <PlaceholderSection title="System Settings" />
          </AdminLayout>
        } 
      />
    </Routes>
  );
};

// Placeholder component for sections we'll implement later
const PlaceholderSection = ({ title }: { title: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Alert className="bg-primary/10 border-primary/20">
        <AlertDescription>
          This section is under development and will be implemented soon.
        </AlertDescription>
      </Alert>
    </div>
  );
};
